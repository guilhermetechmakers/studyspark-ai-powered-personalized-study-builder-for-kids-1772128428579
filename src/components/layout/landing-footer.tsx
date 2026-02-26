import { Link } from 'react-router-dom'
import { Sparkles, Twitter, Linkedin, Instagram, Mail } from 'lucide-react'

const footerLinks = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'How It Works', href: '/#how-it-works' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Help', href: '/help' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

const socialLinks = [
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/studyspark' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/company/studyspark' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/studyspark' },
]

const CONTACT_EMAIL = 'hello@studyspark.com'

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card" role="contentinfo">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-foreground">StudySpark</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              AI-powered personalized study materials for K–12 children. Trustworthy, fast, and parent-controlled.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              {CONTACT_EMAIL}
            </a>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} StudySpark. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
