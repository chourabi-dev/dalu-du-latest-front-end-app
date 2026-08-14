import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  CreditCard,
  Loader2,
  Lock,
  Truck,
  Store,
  UtensilsCrossed,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import OrderHeader from "@/components/ordering/OrderHeader";
import AuthModal from "@/components/ordering/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { ordersApi, paymentsApi, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FulfillmentType, OrderPayload, PaymentMethod } from "@/types/ordering";
import type { OrderSuccessState } from "@/pages/OrderSuccess";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;

// The checkout is a small wizard:
//  1. "location"        — are you already at the restaurant?
//       yes -> fulfillment = dine_in, go straight to the form
//       no  -> restaurant delivers?  yes -> "delivery-choice"   no -> fulfillment = pickup, form
//  2. "delivery-choice"  — (only shown when the restaurant delivers) do you want delivery?
//       yes -> fulfillment = delivery, form
//       no  -> fulfillment = pickup, form
//  3. "form"             — fields + payment method for whichever fulfillment was picked
type Step = "location" | "delivery-choice" | "form";

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingUser, user, openAuthModal } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { selectedRestaurantId, selectedRestaurant } = useRestaurant();

  const restaurantDelivers = !!selectedRestaurant?.deliveryAvailable;

  const [step, setStep] = useState<Step>("location");
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType | null>(null);

  // Form fields
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [notes, setNotes] = useState("");
  const [pickupOption, setPickupOption] = useState<"asap" | "scheduled">("asap");
  const [pickupTime, setPickupTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect back to the menu if the cart is empty.
  useEffect(() => {
    if (items.length === 0) {
      navigate("/order");
    }
  }, [items.length, navigate]);

  const chooseDineIn = () => {
    setFulfillmentType("dine_in");
    setStep("form");
  };

  const chooseNotAtRestaurant = () => {
    if (restaurantDelivers) {
      setStep("delivery-choice");
    } else {
      setFulfillmentType("pickup");
      setStep("form");
    }
  };

  const chooseDelivery = () => {
    setFulfillmentType("delivery");
    setStep("form");
  };

  const choosePickup = () => {
    setFulfillmentType("pickup");
    setStep("form");
  };

  const goBack = () => {
    if (step === "form") {
      setStep(restaurantDelivers && fulfillmentType !== "dine_in" ? "delivery-choice" : "location");
      setFulfillmentType(null);
    } else if (step === "delivery-choice") {
      setStep("location");
    }
  };

  const isFormValid = useMemo(() => {
    if (fulfillmentType === "delivery") return !!address.trim() && !!phone.trim();
    if (fulfillmentType === "pickup") {
      if (!phone.trim()) return false;
      if (pickupOption === "scheduled" && !pickupTime) return false;
      return true;
    }
    return true; // dine_in has no required fields
  }, [fulfillmentType, address, phone, pickupOption, pickupTime]);

  const buildPayload = (method: PaymentMethod, paypalOrderId?: string): OrderPayload => ({
    restaurantId: selectedRestaurantId!,
    fulfillmentType: fulfillmentType!,
    paymentMethod: method,
    ...(fulfillmentType === "delivery" ? { deliveryAddress: address, phone } : {}),
    ...(fulfillmentType === "pickup"
      ? { phone, pickupTime: pickupOption === "asap" ? "asap" : pickupTime }
      : {}),
    notes: notes.trim() || undefined,
    items: items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      extraOptionIds: item.extras.map((e) => e.optionId),
      notes: item.notes,
    })),
    ...(paypalOrderId ? { paypalOrderId } : {}),
  });

  const goToSuccess = (orderId: string, paymentMethod: PaymentMethod) => {
    const state: OrderSuccessState = {
      orderId,
      restaurantName: selectedRestaurant?.name,
      fulfillmentType: fulfillmentType!,
      paymentMethod,
    };
    clearCart();
    navigate("/order-success", { state });
  };

  const handleCashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!selectedRestaurantId || !isFormValid) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const order = await ordersApi.create(buildPayload("cash"));
      goToSuccess(order.id, "cash");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't place your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only reached after PayPal reports the payment as captured — the order
  // is already paid for, so it goes straight to the kitchen instead of
  // waiting on a cashier.
  const handlePaypalCaptured = async (paypalOrderId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const order = await ordersApi.create(buildPayload("online", paypalOrderId));
      goToSuccess(order.id, "online");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Payment succeeded but we couldn't place your order. Please contact the restaurant."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      <OrderHeader />

      <main className="container max-w-lg py-8">
        <h1 className="mb-1 font-serif text-3xl font-bold text-foreground">Checkout</h1>
        <p className="mb-6 text-muted-foreground">{selectedRestaurant?.name}</p>

        {!isAuthenticated && !isLoadingUser ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center shadow-soft">
            <Lock className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h2 className="mb-1 font-serif text-xl text-foreground">Sign in to continue</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              We need your account to confirm this order and keep you posted.
            </p>
            <Button onClick={openAuthModal}>Sign in or create an account</Button>
          </div>
        ) : (
          <>
            {/* Step 1: are you at the restaurant? */}
            {step === "location" && (
              <div className="space-y-4">
                <h2 className="font-serif text-xl text-foreground">Are you at the restaurant right now?</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={chooseDineIn}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border p-6 text-center transition-smooth hover:border-primary/50 hover:bg-primary/5"
                  >
                    <UtensilsCrossed className="h-6 w-6 text-primary" />
                    <span className="font-medium text-foreground">Yes, I'm seated here</span>
                    <span className="text-xs text-muted-foreground">Order straight to your table</span>
                  </button>
                  <button
                    type="button"
                    onClick={chooseNotAtRestaurant}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border p-6 text-center transition-smooth hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Store className="h-6 w-6 text-primary" />
                    <span className="font-medium text-foreground">No, I'm elsewhere</span>
                    <span className="text-xs text-muted-foreground">
                      {restaurantDelivers ? "Delivery or pickup" : "Pickup"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 (only if the restaurant delivers): delivery or pickup? */}
            {step === "delivery-choice" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <h2 className="font-serif text-xl text-foreground">Would you like it delivered?</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={chooseDelivery}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border p-6 text-center transition-smooth hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Truck className="h-6 w-6 text-primary" />
                    <span className="font-medium text-foreground">Yes, deliver it</span>
                    <span className="text-xs text-muted-foreground">To my address</span>
                  </button>
                  <button
                    type="button"
                    onClick={choosePickup}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border p-6 text-center transition-smooth hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Clock className="h-6 w-6 text-primary" />
                    <span className="font-medium text-foreground">No, I'll pick it up</span>
                    <span className="text-xs text-muted-foreground">Choose a time</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: form for whichever fulfillment type was picked */}
            {step === "form" && fulfillmentType && (
              <form onSubmit={handleCashSubmit} className="space-y-6">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>

                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm text-foreground">
                  {fulfillmentType === "dine_in" && <UtensilsCrossed className="h-4 w-4 text-primary" />}
                  {fulfillmentType === "delivery" && <Truck className="h-4 w-4 text-primary" />}
                  {fulfillmentType === "pickup" && <Store className="h-4 w-4 text-primary" />}
                  <span>
                    {fulfillmentType === "dine_in" && "Dining in at the restaurant"}
                    {fulfillmentType === "delivery" && `Delivery from ${selectedRestaurant?.name}`}
                    {fulfillmentType === "pickup" && `Pickup at ${selectedRestaurant?.name}`}
                  </span>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
                  <h2 className="mb-3 font-serif text-lg text-foreground">Order summary</h2>
                  <ul className="space-y-1.5 text-sm">
                    {items.map((item) => (
                      <li key={item.id} className="flex justify-between text-foreground">
                        <span>
                          {item.quantity}× {item.product.name}
                        </span>
                        <span>{item.lineTotal.toFixed(2)} €</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex justify-between border-t border-border pt-3 font-serif text-lg">
                    <span>Total</span>
                    <span className="text-primary">{subtotal.toFixed(2)} €</span>
                  </div>
                </div>

                {/* Fulfillment-specific fields */}
                {fulfillmentType === "dine_in" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Table number / note (optional)</Label>
                    <Textarea
                      id="notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Table 12, allergies, etc."
                    />
                  </div>
                )}

                {fulfillmentType === "delivery" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="address">Delivery address</Label>
                      <Textarea
                        id="address"
                        required
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, city, landmark…"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+49 ..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="notes">Delivery notes (optional)</Label>
                      <Textarea
                        id="notes"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Gate code, floor, instructions for the rider…"
                      />
                    </div>
                  </div>
                )}

                {fulfillmentType === "pickup" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Pickup time</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPickupOption("asap")}
                          className={cn(
                            "rounded-xl border p-3 text-sm font-medium transition-smooth",
                            pickupOption === "asap" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}
                        >
                          As soon as possible
                        </button>
                        <button
                          type="button"
                          onClick={() => setPickupOption("scheduled")}
                          className={cn(
                            "rounded-xl border p-3 text-sm font-medium transition-smooth",
                            pickupOption === "scheduled"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          Pick a time
                        </button>
                      </div>
                      {pickupOption === "scheduled" && (
                        <Input
                          type="time"
                          required
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+49 ..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Allergies, special requests…"
                      />
                    </div>
                  </div>
                )}

                {/* Payment method — available for all three fulfillment types */}
                <div>
                  <Label className="mb-2 block">Payment method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-smooth",
                        paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}
                    >
                      <Banknote className="h-5 w-5 text-primary" />
                      {fulfillmentType === "delivery" ? "Cash on delivery" : "Cash to the cashier"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-smooth",
                        paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}
                    >
                      <CreditCard className="h-5 w-5 text-primary" />
                      Pay online
                      <span className="text-xs text-muted-foreground">Goes straight to the kitchen</span>
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                {paymentMethod === "cash" ? (
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !isFormValid}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Place order · {subtotal.toFixed(2)} €
                  </Button>
                ) : !PAYPAL_CLIENT_ID ? (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    Online payment isn't configured yet (missing VITE_PAYPAL_CLIENT_ID). Choose cash for now.
                  </p>
                ) : !isFormValid ? (
                  <p className="text-center text-sm text-muted-foreground">
                    Fill in the details above to pay online.
                  </p>
                ) : (
                  <div className={cn(isSubmitting && "pointer-events-none opacity-60")}>
                    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR", intent: "capture" }}>
                      <PayPalButtons
                        style={{ layout: "vertical", label: "pay" }}
                        disabled={isSubmitting || !selectedRestaurantId}
                        forceReRender={[subtotal, selectedRestaurantId, fulfillmentType]}
                        createOrder={async () => {
                          setError(null);
                          const ref = await paymentsApi.createPaypalOrder(selectedRestaurantId!, subtotal);
                          return ref.id;
                        }}
                        onApprove={async (data) => {
                          const capture = await paymentsApi.capturePaypalOrder(data.orderID);
                          if (capture.status !== "COMPLETED") {
                            setError("Payment wasn't completed. Please try again.");
                            return;
                          }
                          await handlePaypalCaptured(data.orderID);
                        }}
                        onError={() => setError("PayPal ran into a problem. Please try again.")}
                      />
                    </PayPalScriptProvider>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Total charged: {subtotal.toFixed(2)} € via PayPal
                    </p>
                  </div>
                )}
              </form>
            )}
          </>
        )}
      </main>

      <AuthModal />
    </div>
  );
};

export default Checkout;
