import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("Loader executed for request:", request.url);
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return json({ showForm: Boolean(login) });
};

export default function App() {
  console.log("Programs component rendered");
  const { showForm } = useLoaderData<typeof loader>();

  useEffect(() => {
    console.log("Programs page loaded");
  }, []);

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Pcnaid Loyalty & Rewards</h1>
        <p className={styles.text}>
        Empower your business with a smarter loyalty and rewards program that drives customer engagement and boosts retention.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>https://app.pcnaid.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Product feature</strong>. Seamlessly track customer loyalty points and reward redemption, giving your customers a reason to keep coming back while simplifying program management for you.
          </li>
          <li>
            <strong>Product feature</strong>. Enhance customer satisfaction with personalized rewards tailored to their preferences, fostering stronger relationships and boosting lifetime value.
          </li>
          <li>
            <strong>Product feature</strong>. Gain valuable insights into customer behavior and program performance through detailed analytics, enabling smarter business decisions and higher ROI.
          </li>
        </ul>
      </div>
    </div>
  );
}
