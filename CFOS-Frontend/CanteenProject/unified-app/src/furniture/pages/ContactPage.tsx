import { useState } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import contactBg from "@furniture/assets/images/contact.png";
import { PageContainer } from "@furniture/components/layout/PageContainer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", about: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <PageContainer
      className="relative overflow-hidden"
      innerClassName="relative z-10"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-light via-white to-brand-muted" />
        <img
          src={contactBg}
          alt=""
          className="h-full w-full object-cover opacity-20"
        />
      </div>

      <div className="mb-8">
        <span className="rounded-full bg-brand-muted px-4 py-1 text-xs font-medium text-brand-dark">
          Receive catering
        </span>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          <span className="text-brand">Let&apos;s</span>{" "}
          <span className="text-gray-800">Talk</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <form
          onSubmit={handleSubmit}
          className="animate-fadeIn space-y-5 rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-lg backdrop-blur-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name..."
              required
              className="w-full rounded-xl border border-brand/20 bg-brand-light/60 px-4 py-3 text-gray-700 transition-all duration-300 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              About
            </label>
            <input
              type="text"
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Food, catering, feedback..."
              className="w-full rounded-xl border border-brand/20 bg-brand-light/60 px-4 py-3 text-gray-700 transition-all duration-300 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message..."
              rows={4}
              required
              className="w-full resize-none rounded-xl border border-brand/20 bg-brand-light/60 px-4 py-3 text-gray-700 transition-all duration-300 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          {submitted && (
            <p className="rounded-lg bg-brand-light px-4 py-2 text-sm font-medium text-brand-dark">
              Message sent successfully!
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-lg"
          >
            Contact Us
          </button>
        </form>

        <div
          className="animate-fadeIn space-y-6 rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-lg backdrop-blur-sm"
          style={{ animationDelay: "200ms" }}
        >
          <ContactBlock
            title="Phone"
            items={[
              { icon: Phone, text: "09-979111501" },
              { icon: Phone, text: "09-777111501" },
            ]}
          />
          <ContactBlock
            title="Order Information"
            items={[
              { icon: Mail, text: "kai@gmail.com" },
              { icon: Mail, text: "info@canteen.edu.mm" },
            ]}
          />
          <ContactBlock
            title="Address"
            items={[
              {
                icon: MapPin,
                text: "W3QR+JWM, 73rd Street, Ngu Shwe Wah St, Mandalay",
              },
            ]}
          />
          <ContactBlock
            title="Canteen Hours"
            items={[
              { icon: Clock, text: "Mon - Fri · 7:30 AM - 4:00 PM" },
            ]}
          />
        </div>
      </div>
    </PageContainer>
  );
}

function ContactBlock({
  title,
  items,
}: {
  title: string;
  items: { icon: typeof Phone; text: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-bold text-gray-800">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.text} className="flex items-start gap-3 text-gray-600">
            <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
