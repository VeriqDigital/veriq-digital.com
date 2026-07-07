"use client";
import { useState } from "react";

const FAQData = [
  {
    question: "What are your opening hours?",
    answer:
      "We are open from 4 AM to 12 AM on weekdays, 8 AM to 10 PM on Saturday, and 8 AM to 9 PM on Sunday.",
  },
  {
    question: "Do I need to be a member to work out?",
    answer:
      "No. Visitors can usually train with a day pass, while memberships are available for anyone who plans to come regularly.",
  },
  {
    question: "Can I try the gym before joining?",
    answer:
      "Yes. We offer trial options so you can explore the gym, try the equipment, and see whether the space is a good fit.",
  },
  {
    question: "Do you offer personal training?",
    answer:
      "Yes. Our coaches can help with strength training, conditioning, technique, mobility, and goal-specific programming.",
  },
  {
    question: "Are beginners welcome?",
    answer:
      "Absolutely. Whether you are brand new or returning after time away, our team can help you get started at a comfortable pace.",
  },
  {
    question: "What should I bring for my first visit?",
    answer:
      "Bring comfortable training clothes, clean workout shoes, a water bottle, and any personal items you need for your session.",
  },
  {
    question: "Do you have locker rooms and showers?",
    answer:
      "Yes. Members and guests have access to changing areas, lockers, and showers during staffed and open gym hours.",
  },
  {
    question: "Is there parking available?",
    answer:
      "Yes. Parking is available for members and guests, though availability may vary during peak training hours.",
  },
  {
    question: "Can I bring a guest?",
    answer:
      "Yes. Members can bring guests according to the current guest policy. Guests may need to check in and complete a waiver before training.",
  },
  {
    question: "Do you offer group classes?",
    answer:
      "Yes. We offer group training options for different fitness levels, with classes focused on strength, conditioning, and overall performance.",
  },
  {
    question: "How do I cancel or freeze my membership?",
    answer:
      "Membership changes can be handled through the front desk or member support. Notice periods and freeze options may depend on your plan.",
  },
  {
    question: "Are there age requirements to train?",
    answer:
      "Younger athletes may train with a parent, guardian, or coach approval. Age requirements can vary by membership type and training area.",
  },
  {
    question: "Do you have equipment for strength training?",
    answer:
      "Yes. The gym includes strength equipment such as racks, free weights, benches, machines, and functional training tools.",
  },
  {
    question: "Do you have cardio equipment?",
    answer:
      "Yes. Cardio equipment is available for warmups, conditioning, and standalone cardio sessions.",
  },
  {
    question: "Can I follow my own workout program?",
    answer:
      "Yes. Members are welcome to follow their own training plans as long as they use equipment safely and respect shared spaces.",
  },
  {
    question: "What are your busiest times?",
    answer:
      "Peak times are typically early mornings, evenings, and weekends. Midday and later evening hours are often quieter.",
  },
];
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <h2>Frequently Asked Questions</h2>

      <div className="grid gap-5 md:grid-cols-2">
        {FAQData.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <button
              key={item.question} // better than index if questions are unique
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full cursor-pointer items-stretch text-left transition duration-200 hover:scale-[1.01]"
              aria-expanded={isOpen}
            >
              <div className="w-full rounded-lg border border-white/10 bg-zinc-900 p-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-heading text-xs font-black uppercase tracking-[0.3em]">
                    {item.question}
                  </span>

                  <span className="text-xl leading-none">
                    {isOpen ? "×" : "+"}
                  </span>
                </div>

                {isOpen && <p className="pt-4 text-gray-300">{item.answer}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;

/*
Similar structure to events.
Load question from an object and then display in a clickable grid like in the join plans expandable section
Each question should have a title and a body when clicked



*/
