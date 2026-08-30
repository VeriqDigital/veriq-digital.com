import Link from "next/link";
import { faqs } from "@/data/faq";
import styles from "./FAQ.module.css";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  items?: readonly FAQItem[];
  label?: string;
  title?: string;
  description?: string;
  contactLabel?: string;
  questionsName?: string;
  showLabelLine?: boolean;
};

const FAQ = ({
  items = faqs,
  label = "Common questions",
  title = "What buyers usually want to know.",
  description =
    "Every project is scoped individually, but the fundamentals should be clear before you decide whether a conversation is worthwhile.",
  contactLabel = "Ask a different question",
  questionsName = "homepage-faq",
  showLabelLine = false,
}: FAQProps) => {
  return (
    <div className={styles.faq}>
      <header className={styles.header}>
        <div>
          <p className={showLabelLine ? styles.eyebrowLabel : undefined}>
            {showLabelLine ? <span aria-hidden="true" /> : null}
            {label}
          </p>
          <h2>{title}</h2>
        </div>
        <div>
          <p>{description}</p>
          <Link href="/contact">
            {contactLabel} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <div className={styles.questions}>
        {items.map((item, index) => (
          <details key={item.question} name={questionsName} open={index === 0}>
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
