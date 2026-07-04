import Container from "@/components/ui/Container";

export type ContactInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  birthDate: string;
  gender: string;
  consentName: string;
};

type ProfileProps = {
  contactInfo: ContactInfo;
  onBack: () => void;
  onContactInfoChange: (contactInfo: ContactInfo) => void;
};

const contactFields: {
  label: string;
  name: keyof Pick<
    ContactInfo,
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "address"
    | "city"
    | "state"
    | "zip"
    | "birthDate"
  >;
  type: string;
}[] = [
  { label: "First Name", name: "firstName", type: "text" },
  { label: "Last Name", name: "lastName", type: "text" },
  { label: "Email", name: "email", type: "email" },
  { label: "Mobile phone", name: "phone", type: "tel" },
  { label: "Mailing address", name: "address", type: "text" },
  { label: "City", name: "city", type: "text" },
  { label: "State", name: "state", type: "text" },
  { label: "Zip code", name: "zip", type: "text" },
  { label: "Date of Birth", name: "birthDate", type: "date" },
];

const fieldClass =
  "h-20 w-full rounded-md border border-white/15 bg-zinc-950 px-5 text-base font-semibold text-white outline-none transition duration-200 placeholder:text-white/35 focus:border-green-500";

const Profile = ({
  contactInfo,
  onBack,
  onContactInfoChange,
}: ProfileProps) => {
  const updateContactInfo = (name: keyof ContactInfo, value: string) => {
    onContactInfoChange({
      ...contactInfo,
      [name]: value,
    });
  };

  return (
    <section className="bg-black pb-48">
      <Container>
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={onBack}
            className="mb-5 cursor-pointer text-xs font-black uppercase tracking-widest text-white/50 transition hover:text-white"
          >
            Back
          </button>

          <form className="rounded-lg border border-white/10 bg-zinc-900 p-6 md:p-8">
            <div>
              <h2 className="font-heading text-sm font-black uppercase tracking-[0.35em]">
                Contact Information
              </h2>
              <div className="my-6 h-px bg-white/10" />

              <div className="grid gap-5 md:grid-cols-2">
                {contactFields.map((field) => (
                  <label key={field.name} className="relative block">
                    <span className="sr-only">{field.label}</span>
                    <input
                      className={fieldClass}
                      name={field.name}
                      type={field.type}
                      placeholder={`${field.label} *`}
                      required
                      value={contactInfo[field.name]}
                      onChange={(event) =>
                        updateContactInfo(field.name, event.target.value)
                      }
                    />
                  </label>
                ))}

                <label className="relative block">
                  <span className="sr-only">Gender</span>
                  <select
                    name="gender"
                    className={`${fieldClass} appearance-none text-white/40`}
                    value={contactInfo.gender}
                    onChange={(event) =>
                      updateContactInfo("gender", event.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option>Woman</option>
                    <option>Man</option>
                    <option>Non-binary</option>
                    <option>Prefer not to say</option>
                  </select>
                  <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-white/50">
                    v
                  </span>
                </label>
              </div>

              <div className="mt-8 rounded-md border border-white/10 bg-black/20 p-5">
                <p className="text-sm leading-relaxed text-white/55">
                  By typing your full name below, you agree that Iron Palace may
                  deliver calls, telemarketing calls, SMS messages, voicemail
                  messages and similar communications to the telephone number
                  provided. Message and data rates may apply. Text STOP to
                  cancel.
                </p>
                <label className="mt-5 block">
                  <span className="sr-only">Type your full name to confirm</span>
                  <input
                    className={fieldClass}
                    name="consentName"
                    type="text"
                    placeholder="Type your full name to confirm *"
                    required
                    value={contactInfo.consentName}
                    onChange={(event) =>
                      updateContactInfo("consentName", event.target.value)
                    }
                  />
                </label>
              </div>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
};

export default Profile;
