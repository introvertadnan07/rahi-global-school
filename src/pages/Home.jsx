import { useEffect, useState } from "react";

import Hero from "../components/Hero";
import SectionTitle from "../components/SectionTitle";
import Button from "../components/Button";
import FacilityCard from "../components/FacilityCard";
import SchoolCard from "../components/SchoolCard";
import TestimonialCard from "../components/TestimonialCard";
import ParentFeedbackForm from "../components/ParentFeedbackForm";

import { facilities } from "../data/facilities";
import { activities } from "../data/activities";

const API_URL = "http://localhost:5000/api";

export default function Home() {
  const [testimonials, setTestimonials] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApprovedFeedback() {
      try {
        const response = await fetch(`${API_URL}/feedback/approved`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load parent feedback.");
        }

        const data = await response.json();
        setTestimonials(
          Array.isArray(data.feedback)
            ? data.feedback
            : Array.isArray(data)
              ? data
              : []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Parent feedback loading error:", error);
          setTestimonials([]);
        }
      } finally {
        if (!controller.signal.aborted) setFeedbackLoading(false);
      }
    }

    loadApprovedFeedback();
    return () => controller.abort();
  }, []);

  return (
    <>
      <Hero />

      {/* Why Rahi */}
      <section className="container-x py-24">
        <SectionTitle
          eyebrow="Why Rahi?"
          title="A school built around the whole child."
          text="We combine strong foundations with creativity, play, technology and character so children are prepared for both today and tomorrow."
          center
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {facilities.slice(0, 6).map((facility) => (
            <FacilityCard key={facility.title} {...facility} />
          ))}
        </div>
      </section>

      {/* Learning Journey */}
      <section className="bg-[#FFF9E8] py-20 sm:py-24 lg:py-28">
        <div className="container-x">
          <SectionTitle
            eyebrow="Learning Journey"
            title="Every age. Every stage. Every child."
          />
          <div className="mt-12 grid items-stretch gap-7 md:grid-cols-3 lg:gap-8">
            <SchoolCard
              title="Early Years"
              text="A playful foundation where children build language, confidence and a love for discovery."
              image="/images/classroom.jpg"
            />
            <SchoolCard
              title="Primary School"
              text="Strong academic foundations balanced with projects, collaboration and creativity."
              image="/images/campus.jpg"
            />
            <SchoolCard
              title="Middle School"
              text="Growing independence, deeper thinking and experiences that prepare students for the wider world."
              image="/images/library.jpg"
            />
          </div>
        </div>
      </section>

      {/* Student Life */}
      <section className="container-x py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionTitle
            eyebrow="Beyond The Classroom"
            title="Learn by doing. Grow by exploring."
          />
          <Button to="/student-life">See Student Life</Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((activity) => (
            <SchoolCard
              key={activity.title}
              title={activity.title}
              text={`${activity.tag} • Experiences that help children discover their strengths.`}
              image={activity.image}
            />
          ))}
        </div>
      </section>

      {/* Approved Parent Testimonials */}
      <section className="bg-navy py-24">
        <div className="container-x">
          <SectionTitle
            eyebrow="Parents Say"
            title="A community that feels like home."
            center
          />
          {feedbackLoading ? (
            <p className="mt-12 text-center text-white/70">
              Loading parent feedback...
            </p>
          ) : testimonials.length === 0 ? (
            <p className="mt-12 text-center text-white/70">
              No parent reviews available yet.
            </p>
          ) : (
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial._id}
                  name={testimonial.parentName || "Parent"}
                  text={testimonial.message}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Parent Feedback Form */}
      <ParentFeedbackForm />

      {/* Admissions CTA */}
      <section className="container-x py-24">
        <div className="overflow-hidden rounded-[2.5rem] bg-sky p-8 md:p-14">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-extrabold text-white">
                Ready to begin?
              </span>
              <h2 className="mt-5 text-4xl font-black text-white md:text-5xl">
                Give your child a place to learn, belong and shine.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">
                Take the first step toward joining the Rahi Global School
                community.
              </p>
            </div>
            <Button to="/admissions" variant="secondary">
              Start Admission Enquiry
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
