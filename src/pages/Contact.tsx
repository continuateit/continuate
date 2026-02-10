import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";

const WEBHOOK_URLS: Record<string, string> = {
  general: "https://humblemindailabs.app.n8n.cloud/webhook/f1f4af51-1bf1-4622-90b5-46fd140f24ec",
  managed_it: "https://humblemindailabs.app.n8n.cloud/webhook/f1f4af51-1bf1-4622-90b5-46fd140f24ec",
  cybersecurity: "https://humblemindailabs.app.n8n.cloud/webhook/f1f4af51-1bf1-4622-90b5-46fd140f24ec",
  backup_dr: "https://humblemindailabs.app.n8n.cloud/webhook/f1f4af51-1bf1-4622-90b5-46fd140f24ec",
  networking: "https://humblemindailabs.app.n8n.cloud/webhook/f1f4af51-1bf1-4622-90b5-46fd140f24ec",
  cctv_biometrics: "https://humblemindailabs.app.n8n.cloud/webhook/f1f4af51-1bf1-4622-90b5-46fd140f24ec",
  server_rooms: "https://humblemindailabs.app.n8n.cloud/webhook/f1f4af51-1bf1-4622-90b5-46fd140f24ec",
};

const SERVICE_OPTIONS = [
  { value: "general", label: "General Enquiry" },
  { value: "managed_it", label: "Managed IT Support" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "backup_dr", label: "Backup & DR" },
  { value: "networking", label: "Networking" },
  { value: "cctv_biometrics", label: "CCTV & Biometrics" },
  { value: "server_rooms", label: "Server Rooms & Hardware" },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", company: "", service: "general", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const webhookUrl = WEBHOOK_URLS[formData.service];
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      toast({
        title: "Message Sent",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", company: "", service: "general", message: "" });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Unable to send your message. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="section-padding bg-primary">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-primary-foreground/50 mb-4">Contact</p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Let's Talk Security
            </h1>
            <p className="text-lg text-primary-foreground/60 leading-relaxed">
              Get in touch for a free consultation, quote, or to learn more about our managed IT services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="section-padding bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors"
                      placeholder="john@company.co.za"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors"
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Service *</label>
                  <select
                    required
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors"
                  >
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors resize-none"
                    placeholder="Tell us about your IT security needs..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Send Message"} <Send size={16} />
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">Get in Touch</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-foreground mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Visit Us</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Johannesburg, Gauteng<br />
                      South Africa
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} className="text-foreground mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Call Us</h4>
                    <p className="text-muted-foreground text-sm">+27 73 209 9100</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail size={20} className="text-foreground mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Email Us</h4>
                    <p className="text-muted-foreground text-sm">info@continuate.co.za</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-8 bg-secondary border border-border">
                <h4 className="font-display text-lg font-semibold text-foreground mb-3">Business Hours</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Monday – Friday</span>
                    <span className="text-foreground font-medium">08:00 – 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-foreground font-medium">09:00 – 13:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-foreground font-medium">Closed</span>
                  </div>
                  <div className="pt-4 border-t border-border mt-4">
                    <p className="text-foreground font-medium">24/7 Emergency Support</p>
                    <p className="text-muted-foreground text-xs mt-1">Available for clients on Professional and Enterprise plans.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
