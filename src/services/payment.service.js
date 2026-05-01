const Stripe = require("stripe");
const { env } = require("../config/env");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

let stripeClient = null;

const getStripeClient = () => {
  if (!env.stripeSecretKey) {
    throw buildError("Stripe secret key is not configured", 500);
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey);
  }

  return stripeClient;
};

const mockGateway = {
  async createCheckoutSession({ payment }) {
    return {
      transactionRef: payment.transactionRef,
      checkoutUrl: `https://mock-payments.local/checkout/${payment.transactionRef}`,
      raw: {
        gateway: "mock",
        transactionRef: payment.transactionRef
      }
    };
  },
  async verifyPayment({ transactionRef }) {
    return {
      isPaid: true,
      transactionRef,
      raw: {
        gateway: "mock",
        verifiedAt: new Date().toISOString()
      }
    };
  }
};

const stripeGateway = {
  async createCheckoutSession({ payment, plan, user }) {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${env.clientWebUrl}/payment/success?tx=${payment.transactionRef}`,
      cancel_url: `${env.clientWebUrl}/payment/cancel?tx=${payment.transactionRef}`,
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: String(plan.currency || "USD").toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.description
            },
            unit_amount: Math.round(plan.price * 100)
          },
          quantity: 1
        }
      ],
      metadata: {
        transactionRef: payment.transactionRef,
        subscriptionId: String(payment.subscription)
      }
    });

    return {
      transactionRef: payment.transactionRef,
      checkoutUrl: session.url,
      raw: session
    };
  },
  async verifyPayment({ sessionId }) {
    if (!sessionId) {
      throw buildError("sessionId is required for Stripe verification", 400);
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return {
      isPaid: session.payment_status === "paid",
      transactionRef: session.metadata.transactionRef,
      raw: session
    };
  }
};

const getPaymentGateway = () => {
  if (env.paymentGateway === "stripe") {
    return stripeGateway;
  }

  return mockGateway;
};

module.exports = {
  getPaymentGateway
};
