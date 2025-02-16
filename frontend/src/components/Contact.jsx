// Contact.jsx
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import emailjs from "@emailjs/browser";
import contactImg from "../assets/contectvsm.gif"; // Contact image

// Contact Form Component inside Contact.jsx
const ContactForm = () => {
  const form = useRef();
  const [status, setStatus] = useState({ type: "", message: "" });

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Sending..." });

    emailjs
      .sendForm(
        "service_mco82ym",
        "template_7s7n3ea",
        form.current,
        "ajykOHZkq5Q6Z5rlX"
      )
      .then(() => {
        setStatus({ type: "success", message: "Message sent successfully!" });
        form.current.reset();
        setTimeout(() => {
          setStatus({ type: "", message: "" });
        }, 5000);
      })
      .catch(() => {
        setStatus({
          type: "error",
          message: "Failed to send message. Please try again.",
        });
      });
  };

  return (
    <form ref={form} onSubmit={sendEmail} className="w-full max-w-lg">
      <div className="form-group mb-6 relative">
        <input
          type="text"
          name="user_name"
          required
          placeholder="Your Name"
          className="input-neon w-full"
        />
        <div className="glow" />
      </div>
      <div className="form-group mb-6 relative">
        <input
          type="email"
          name="user_email"
          required
          placeholder="Your Email"
          className="input-neon w-full"
        />
        <div className="glow" />
      </div>
      <div className="form-group mb-6 relative">
        <textarea
          name="message"
          required
          placeholder="Your Message"
          className="input-neon w-full"
          rows="5"
        />
        <div className="glow" />
      </div>
      <button
        type="submit"
        className="neon-button w-full flex items-center justify-center"
        disabled={status.type === "loading"}
      >
        {status.type === "loading" ? (
          <div className="flex items-center">
            <div className="animate-spin mr-2 border-2 border-t-2 border-white rounded-full h-5 w-5" />
            <span>Sending...</span>
          </div>
        ) : (
          <>
            <Send className="mr-2" />
            <span>Send Message</span>
          </>
        )}
      </button>
      {status.message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`status-message ${status.type}`}
        >
          {status.message}
        </motion.div>
      )}
    </form>
  );
};

const Contact = () => {
  return (
    <section
      id="contact"
      className="min-h-screen relative flex flex-col md:flex-row bg-gradient-to-br from-black to-gray-900"
    >
      {/* Mobile Background Image */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          backgroundImage: `url(${contactImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.3,
        }}
      ></div>

      {/* Desktop Image Container */}
      <div className="hidden md:flex md:w-1/2 mt-16 ml-4 justify-center items-center p-8">
        <img
          src={contactImg}
          alt="Neon"
          className="image-neon md:ml-20 md:mt-20 ml-0 mt-0"
        />
      </div>

      {/* Contact Form Content */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col mt-20 justify-center items-center p-8 bg-black bg-opacity-60 md:bg-transparent rounded-lg max-h-screen overflow-y-auto">
        <h2 className="neon-text mb-8 mt-18">Get in Touch</h2>
        <ContactForm />
      </div>
    </section>
  );
};

export default Contact;
