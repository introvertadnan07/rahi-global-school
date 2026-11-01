
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";

const API_URL = "http://localhost:5000/api";

const pageContent = {
  "/about": {
    eyebrow: "ABOUT OUR SCHOOL",
    title: "A Place Where Every Child Can Shine",
    description:
      "At Rahi Global School, we believe every child deserves an environment where curiosity, creativity and confidence grow together.",
    heading: "Our Vision",
    body:
      "We aim to nurture responsible, confident and compassionate learners through quality education, practical learning and strong values.",
    features: [
      {
        title: "Our Mission",
        text: "To provide meaningful learning experiences that help every child discover their potential.",
      },
      {
        title: "Our Values",
        text: "Respect, honesty, curiosity, kindness and responsibility guide our school community.",
      },
      {
        title: "Our Approach",
        text: "We encourage active participation, creative thinking and learning beyond textbooks.",
      },
    ],
  },

  "/academics": {
    eyebrow: "ACADEMIC EXCELLENCE",
    title: "Learning That Builds Bright Futures",
    description:
      "We encourage students to understand concepts, ask questions and develop the skills they need for lifelong learning.",
    heading: "A Strong Foundation for Success",
    body:
      "Our academic approach combines classroom learning, activities, regular feedback and opportunities to explore new ideas.",
    features: [
      {
        title: "Concept-Based Learning",
        text: "Build strong fundamentals through clear explanations and practical examples.",
      },
      {
        title: "Creative Thinking",
        text: "Encourage questions, exploration, collaboration and independent ideas.",
      },
      {
        title: "Holistic Development",
        text: "Balance academic progress with communication, teamwork and personal growth.",
      },
    ],
  },

  "/campus": {
    eyebrow: "OUR CAMPUS",
    title: "A Welcoming Space to Learn and Grow",
    description:
      "A positive school environment helps children feel comfortable, explore their interests and build meaningful friendships.",
    heading: "Designed Around Student Growth",
    body:
      "We strive to create a welcoming learning environment that supports curiosity, collaboration and student well-being.",
    features: [
      {
        title: "Learning Spaces",
        text: "An environment designed to encourage participation and focused learning.",
      },
      {
        title: "Student Well-Being",
        text: "A caring school culture that values respect, safety and belonging.",
      },
      {
        title: "Community",
        text: "Opportunities for students, teachers and families to work together.",
      },
    ],
  },

  "/student-life": {
    eyebrow: "LIFE AT RAHI",
    title: "Learning Beyond the Classroom",
    description:
      "School life is about discovering talents, making friends, exploring interests and learning to work together.",
    heading: "Every Experience Helps Us Grow",
    body:
      "We value activities that encourage confidence, creativity, teamwork and a sense of responsibility.",
    features: [
      {
        title: "Sports and Fitness",
        text: "Develop teamwork, discipline and a healthy attitude towards physical activity.",
      },
      {
        title: "Arts and Creativity",
        text: "Give students opportunities to express themselves and explore their imagination.",
      },
      {
        title: "Events and Activities",
        text: "Celebrate participation, cooperation and the achievements of our school community.",
      },
    ],
  },
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60";

function PageHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
        {eyebrow}
      </p>

      <h1 className="text-3xl font-extrabold leading-tight text-blue-950 sm:text-5xl">
        {title}
      </h1>

      <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function Feedback({ feedback }) {
  if (!feedback) return null;

  const isSuccess = feedback.type === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mb-5 rounded-xl border p-4 text-sm ${
        isSuccess
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {feedback.message}
    </div>
  );
}

function StandardPage() {
  const { pathname } = useLocation();
  const page = pageContent[pathname] || pageContent["/about"];

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageHeading
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
        />

        <section className="grid items-start gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-blue-950 p-8 text-white shadow-lg sm:p-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-amber-400">
              Rahi Global School
            </p>

            <h2 className="text-2xl font-bold sm:text-3xl">
              {page.heading}
            </h2>

            <p className="mt-5 leading-8 text-blue-100">
              {page.body}
            </p>

            <p className="mt-8 font-semibold text-amber-300">
              The Path to Real Success
            </p>
          </div>

          <div className="space-y-5">
            {page.features.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-bold text-blue-950">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <h3 className="text-xl font-bold text-blue-950">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Admissions() {
  const [form, setForm] = useState({
    parentName: "",
    childName: "",
    phone: "",
    email: "",
    classApplyingFor: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [enquiryId, setEnquiryId] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [acknowledgementData, setAcknowledgementData] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(enquiryId);
      setCopyMessage("Enquiry ID copied successfully!");
    } catch {
      setCopyMessage("Copy failed. Please copy the ID manually.");
    }
  }

  async function handleDownloadAcknowledgement() {
    if (!acknowledgementData || !enquiryId) return;

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const navy = [12, 35, 78];
      const blue = [28, 91, 160];
      const gold = [218, 157, 26];
      const paleBlue = [235, 244, 255];
      const pageWidth = 210;
      const margin = 15;

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, "F");
      doc.setFillColor(...navy);
      doc.rect(0, 0, pageWidth, 5, "F");
      doc.setFillColor(...gold);
      doc.rect(0, 5, pageWidth, 1.5, "F");

      // Use the school's supplied original logo from public/images.
      try {
        const logo = new Image();
        logo.src = "/images/rahi-global-school-logo.png";
        await new Promise((resolve, reject) => {
          logo.onload = resolve;
          logo.onerror = reject;
        });
        doc.addImage(logo, "PNG", 83, 13, 44, 44, undefined, "FAST");
      } catch {
        // Keep the acknowledgement usable even if the logo asset is unavailable.
        doc.setTextColor(...navy);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(17);
        doc.text("RAHI GLOBAL SCHOOL", 105, 34, { align: "center" });
      }

      doc.setTextColor(...navy);
      doc.setFont("times", "bold");
      doc.setFontSize(23);
      doc.text("RAHI GLOBAL SCHOOL", 105, 66, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...blue);
      doc.text("The Path to Real Success", 105, 73, { align: "center" });

      doc.setDrawColor(...gold);
      doc.setLineWidth(0.8);
      doc.line(28, 81, 182, 81);
      doc.setTextColor(...navy);
      doc.setFont("times", "bold");
      doc.setFontSize(19);
      doc.text("ADMISSION ENQUIRY ACKNOWLEDGEMENT", 105, 93, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(45, 55, 72);
      doc.text(`Dear ${acknowledgementData.parentName || "Parent / Guardian"},`, margin, 108);
      const intro = "Thank you for your interest in Rahi Global School. We have successfully received your admission enquiry. Our admissions team will review the details and get in touch with you.";
      doc.text(doc.splitTextToSize(intro, 180), margin, 117, { lineHeightFactor: 1.5 });

      const boxY = 139;
      doc.setFillColor(249, 251, 255);
      doc.setDrawColor(190, 210, 235);
      doc.roundedRect(margin, boxY, 180, 91, 3, 3, "FD");
      doc.setFillColor(...navy);
      doc.roundedRect(margin, boxY, 180, 13, 3, 3, "F");
      doc.rect(margin, boxY + 9, 180, 4, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("ENQUIRY DETAILS", 21, boxY + 8.5);

      const rows = [
        ["Enquiry ID", acknowledgementData.enquiryId],
        ["Parent / Guardian", acknowledgementData.parentName],
        ["Child's Name", acknowledgementData.childName],
        ["Contact Number", acknowledgementData.phone],
        ["Email Address", acknowledgementData.email],
        ["Class Applying For", acknowledgementData.classApplyingFor],
        ["Enquiry Date", acknowledgementData.submissionDate],
      ];
      let y = boxY + 23;
      rows.forEach(([label, value], index) => {
        if (index % 2 === 0) {
          doc.setFillColor(...paleBlue);
          doc.roundedRect(19, y - 5.2, 172, 9, 1.5, 1.5, "F");
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...navy);
        doc.text(label, 23, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(35, 45, 65);
        const valueLines = doc.splitTextToSize(String(value || "—"), 91);
        doc.text(valueLines.slice(0, 2), 83, y);
        y += 10;
      });

      const nextY = 242;

      doc.setFillColor(...paleBlue);
      doc.roundedRect(margin, nextY, 180, 22, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...navy);
      doc.text("WHAT HAPPENS NEXT?", 20, nextY + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(45, 55, 72);
      doc.text("Our admissions team will review your enquiry and contact you with the next steps.", 20, nextY + 15);

      doc.setDrawColor(...gold);
      doc.setLineWidth(0.7);
      doc.line(margin, 278, 195, 278);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...navy);
      doc.text("ADMISSION TEAM", margin, 286);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Rahi Global School  |  The Path to Real Success", margin, 291);
      doc.setFontSize(7.5);
      doc.setTextColor(90, 100, 115);
      doc.text("This acknowledgement confirms receipt of an enquiry only; it is not an admission confirmation.", 105, 296, { align: "center" });

      doc.save(`Rahi-Admission-Acknowledgement-${enquiryId}.pdf`);
    } catch (error) {
      setCopyMessage("PDF could not be generated. Please try again.");
      console.error("Acknowledgement PDF error:", error);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);
    setEnquiryId("");
    setCopyMessage("");
    setAcknowledgementData(null);
    setLoading(true);

    try {
      const payload = {
        parentName: form.parentName.trim(),
        phone: form.phone.trim(),
        childName: form.childName.trim(),
        email: form.email.trim(),
        classApplyingFor: form.classApplyingFor,
        message: form.message.trim(),
      };

      const response = await fetch(`${API_URL}/admissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Admission enquiry submission failed.");
      }

      const newEnquiryId = String(result.enquiryId);
      setEnquiryId(newEnquiryId);
      setAcknowledgementData({
        ...payload,
        enquiryId: newEnquiryId,
        submissionDate: new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setFeedback({
        type: "success",
        message: result.message || "Admission enquiry submitted successfully!",
      });
      setForm({
        parentName: "",
        childName: "",
        phone: "",
        email: "",
        classApplyingFor: "",
        message: "",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Could not connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageHeading
          eyebrow="ADMISSIONS OPEN"
          title="Start Your Child's Journey"
          description="Share your details with Rahi Global School. Our admissions team can follow up with you about the next steps."
        />

        <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-3xl bg-blue-950 p-8 text-white sm:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">Join Our Community</p>
            <h2 className="mt-4 text-3xl font-bold">Every great journey begins with a first step.</h2>
            <p className="mt-5 leading-8 text-blue-100">
              Tell us about your child and the class you are interested in. Our team can help you understand the admission process.
            </p>
            <ul className="mt-8 space-y-4 text-blue-50">
              <li>✓ Share your admission enquiry</li>
              <li>✓ Discuss the appropriate class</li>
              <li>✓ Learn about admission formalities</li>
            </ul>
          </aside>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-9">
            <h2 className="mb-2 text-2xl font-bold text-blue-950">Admission Enquiry Form</h2>
            <p className="mb-7 text-sm text-slate-500">Fields marked with * are required.</p>
            <Feedback feedback={feedback} />

            {enquiryId && (
              <section className="mb-7 rounded-2xl border border-green-200 bg-green-50 p-5">
                <h3 className="font-bold text-green-800">Your Enquiry ID</h3>
                <p className="mt-3 break-all rounded-xl bg-white p-4 font-mono font-bold text-blue-950">{enquiryId}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={handleCopyId} className="rounded-xl border border-blue-950 px-4 py-3 font-semibold text-blue-950 hover:bg-blue-50">
                    Copy Enquiry ID
                  </button>
                  <button type="button" onClick={handleDownloadAcknowledgement} className="rounded-xl bg-blue-950 px-4 py-3 font-semibold text-white hover:bg-blue-900">
                    Download Acknowledgement
                  </button>
                </div>
                {copyMessage && <p role="status" className="mt-3 text-sm text-green-800">{copyMessage}</p>}
                <a href="/admission-tracker" className="mt-4 inline-block font-semibold text-blue-900 underline">
                  Track Your Admission →
                </a>
              </section>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Parent / Guardian Name *
                <input className={`${inputClass} mt-2`} name="parentName" value={form.parentName} onChange={handleChange} placeholder="Enter parent name" maxLength={100} autoComplete="name" required />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Child's Name *
                <input className={`${inputClass} mt-2`} name="childName" value={form.childName} onChange={handleChange} placeholder="Enter child's name" maxLength={100} required />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Phone Number *
                <input className={`${inputClass} mt-2`} type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" pattern="[0-9]{10,15}" maxLength={15} autoComplete="tel" required />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Email Address *
                <input className={`${inputClass} mt-2`} type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" maxLength={254} autoComplete="email" required />
              </label>
              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                Class Applying For *
                <select className={`${inputClass} mt-2`} name="classApplyingFor" value={form.classApplyingFor} onChange={handleChange} required>
                  <option value="">Select a class</option>
                  {["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map((schoolClass) => (
                    <option key={schoolClass} value={schoolClass}>{schoolClass}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                Additional Information
                <textarea className={`${inputClass} mt-2 min-h-32 resize-y`} name="message" value={form.message} onChange={handleChange} placeholder="Any questions or details you'd like to share?" maxLength={1000} />
              </label>
            </div>

            <button className={`${primaryButtonClass} mt-7 w-full`} type="submit" disabled={loading}>
              {loading ? "Submitting Enquiry..." : "Submit Admission Enquiry"}
            </button>
            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              Your details will be used to respond to your admission enquiry.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send your message.");
      }

      setFeedback({
        type: "success",
        message: result.message,
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.message ||
          "Could not connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageHeading
          eyebrow="GET IN TOUCH"
          title="We Would Love to Hear From You"
          description="Have a question about Rahi Global School? Send us a message and our team can get back to you."
        />

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <section className="rounded-3xl bg-blue-950 p-8 text-white sm:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
              Contact Rahi
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              Let's start a conversation.
            </h2>

            <p className="mt-5 leading-8 text-blue-100">
              Whether you have an admission question or want to learn more
              about our school, please use the contact form.
            </p>

            <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5">
              <h3 className="font-bold text-amber-300">
                Rahi Global School
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                The Path to Real Success
              </p>

              <p className="mt-4 text-sm text-blue-100">
                Please submit your question using the form. We have not
                displayed an address or phone number here because those
                details need to be confirmed by the school.
              </p>
            </div>
          </section>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-9"
          >
            <h2 className="mb-2 text-2xl font-bold text-blue-950">
              Send Us a Message
            </h2>

            <p className="mb-7 text-sm text-slate-500">
              Tell us how we can help.
            </p>

            <Feedback feedback={feedback} />

            <div className="space-y-5">
              <label className="block text-sm font-semibold text-slate-700">
                Full Name *
                <input
                  className={`${inputClass} mt-2`}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Email Address *
                <input
                  className={`${inputClass} mt-2`}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  maxLength={254}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Phone Number
                <input
                  className={`${inputClass} mt-2`}
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Optional phone number"
                  maxLength={20}
                  autoComplete="tel"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Your Message *
                <textarea
                  className={`${inputClass} mt-2 min-h-36 resize-y`}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  maxLength={2000}
                  required
                />
              </label>
            </div>

            <button
              className={`${primaryButtonClass} mt-7 w-full`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending Message..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Gallery() {
  const images = [
    {
      src: "/images/campus.jpg",
      alt: "Rahi Global School campus",
    },
    {
      src: "/images/hero-kids.jpg",
      alt: "Students learning together",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageHeading
          eyebrow="SCHOOL GALLERY"
          title="A Glimpse Into School Life"
          description="Explore moments that represent learning, discovery and our school community."
        />

        <div className="grid gap-6 sm:grid-cols-2">
          {images.map((image) => (
            <figure
              key={image.src}
              className="overflow-hidden rounded-3xl bg-white shadow-sm"
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="h-72 w-full object-cover transition duration-500 hover:scale-105"
              />

              <figcaption className="p-5 font-semibold text-blue-950">
                {image.alt}
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Add more school photographs to the public/images folder to expand
          this gallery.
        </p>
      </div>
    </main>
  );
}

export { StandardPage, Admissions, Gallery, Contact };
