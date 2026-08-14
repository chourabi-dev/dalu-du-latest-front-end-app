import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderHeader from "@/components/ordering/OrderHeader";
import { useAuth } from "@/contexts/AuthContext";
import type { FulfillmentType, PaymentMethod } from "@/types/ordering";

// State handed off by Checkout.tsx via navigate("/order-success", { state }).
export interface OrderSuccessState {
  orderId: string;
  restaurantName?: string;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
}

const fulfillmentNote = (fulfillmentType: FulfillmentType, paymentMethod: PaymentMethod) => {
  if (fulfillmentType === "dine_in") {
    return paymentMethod === "cash"
      ? "Pay the cashier whenever you're ready."
      : "It's already been sent to the kitchen.";
  }
  if (fulfillmentType === "delivery") {
    return paymentMethod === "cash"
      ? "You'll pay cash when it arrives."
      : "It's being prepared and will be on its way to you shortly.";
  }
  // pickup
  return paymentMethod === "cash"
    ? "Pay at the counter when you collect it."
    : "Just show your order reference when you collect it.";
};

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useLocation() as { state: OrderSuccessState | null };

  // Landing here directly (refresh, back button, shared link) without an
  // order in hand doesn't make sense — send them back to the menu.
  useEffect(() => {
    if (!state?.orderId) {
      navigate("/order", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.orderId) return null;

  const { orderId, restaurantName, fulfillmentType, paymentMethod } = state;

  return (
    <div className="min-h-screen bg-gradient-warm">
      <OrderHeader />

      <main className="container flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-6 py-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle2 className="h-14 w-14 text-primary" />
          <h1 className="font-serif text-3xl font-bold text-foreground">Order placed!</h1>
          <p className="max-w-md text-muted-foreground">
            Thanks{user?.name ? `, ${user.name}` : ""} — your order is confirmed
            {restaurantName ? ` with ${restaurantName}` : ""}. {fulfillmentNote(fulfillmentType, paymentMethod)}
          </p>
          <p className="text-sm text-muted-foreground">Order reference: {orderId}</p>
        </div>

        {/* Reserved for the loyalty program: points earned on this order and
            progress toward a free meal. Not wired up yet — this is just the
            placeholder spot in the layout for when that feature ships. */}
        <div className="w-full rounded-xl border border-dashed border-primary/40 bg-card/60 p-5">
          <div className="mb-1 flex items-center justify-center gap-2 text-primary">
            <Gift className="h-5 w-5" />
            <span className="font-serif text-lg">Rewards</span>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Points and free-meal rewards are coming soon.
          </p>
        </div>

        <Button onClick={() => navigate("/order")} size="lg">
          Back to menu
        </Button>
      </main>
    </div>
  );
};

export default OrderSuccess;
