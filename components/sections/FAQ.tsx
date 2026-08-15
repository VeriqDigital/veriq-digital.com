import Link from "next/link";
import { faqs } from "@/data/faq";
import styles from "./FAQ.module.css";

const FAQ = () => {
  return (
    <div className={styles.faq}>
      <header className={styles.header}>
        <div>
          <p>Common questions</p>
          <h2>What buyers usually want to know.</h2>
        </div>
        <div>
          <p>
            Every project is scoped individually, but the fundamentals should
            be clear before you decide whether a conversation is worthwhile.
          </p>
          <Link href="/contact">
            Ask a different question <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <div className={styles.questions}>
        {faqs.map((item, index) => (
          <details key={item.question} name="homepage-faq" open={index === 0}>
            <summary>
              <span>{item.question}</span>
              <i aria-hidden="true">+</i>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
