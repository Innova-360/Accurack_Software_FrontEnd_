import React from 'react';
import Header from '../components/Header';

const TermsAndConditions: React.FC = () => {
  return (
    <>
    <Header/>
    <div className="min-h-screen bg-[#03414CF0] py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto text-black">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto">
            These Terms of Service govern your use of the Accurack application. By using the App, you agree to be bound by these Terms.
          </p>
        </header>

        {/* Main Content */}
        <main className="bg-white rounded-lg shadow-lg p-8 md:p-12">

          {/* Section 1: Use of the App */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              1. Use of the App
            </h2>
            <ul className=" pl-6 space-y-2">
              <li>1.1&nbsp;&nbsp;&nbsp;&nbsp;You must be at least 18 years old or the legal age in your jurisdiction to use this App.</li>
              <li>1.2&nbsp;&nbsp;&nbsp;&nbsp;You may only use the App for lawful business purposes.</li>
              <li>1.3&nbsp;&nbsp;&nbsp;&nbsp;You are responsible for all activity under your account.</li>
            </ul>
          </section>

          {/* Section 2: Account Registration */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              2. Account Registration
            </h2>
            <ul className=" pl-6 space-y-2">
              <li>2.1&nbsp;&nbsp;&nbsp;&nbsp;You agree to provide accurate and complete information.</li>
              <li>2.2&nbsp;&nbsp;&nbsp;&nbsp;You are responsible for safeguarding your password and access credentials.</li>
              <li>2.3&nbsp;&nbsp;&nbsp;&nbsp;We reserve the right to suspend accounts involved in suspicious or unauthorized activities.</li>
            </ul>
          </section>

          {/* Section 3: License */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              3. License
            </h2>
            <p>
              We grant you a non-exclusive, non-transferable, revocable license to use the App solely for business purposes, subject to these Terms.
            </p>
          </section>

          {/* Section 4: Prohibited Conduct */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              4. Prohibited Conduct
            </h2>
            <ul className=" pl-6 space-y-2">
              <li>4.1&nbsp;&nbsp;&nbsp;&nbsp;Misuse the App (e.g., distribute malware, overburden servers).</li>
              <li>4.2&nbsp;&nbsp;&nbsp;&nbsp;Reverse-engineer or copy parts of the App.</li>
              <li>4.3&nbsp;&nbsp;&nbsp;&nbsp;Use the App for unlawful or fraudulent activities.</li>
            </ul>
          </section>

          {/* Section 5: Fees and Payments */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              5. Fees and Payments
            </h2>
            <ul className=" pl-6 space-y-2">
              <li>5.1&nbsp;&nbsp;&nbsp;&nbsp;You agree to pay any applicable subscription fees or in-app purchases.</li>
              <li>5.2&nbsp;&nbsp;&nbsp;&nbsp;All sales are final unless otherwise stated.</li>
              <li>5.3&nbsp;&nbsp;&nbsp;&nbsp;Failure to pay may result in suspension of access.</li>
            </ul>
          </section>

          {/* Section 6: Data & Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              6. Data & Privacy
            </h2>
            <p>
              Use of the App is also governed by our <a href="/privacy-policy" className="text-[var(--primary-color)] underline">Privacy Policy</a>, which outlines how we handle your data.
            </p>
          </section>

          {/* Section 7: Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              7. Intellectual Property
            </h2>
            <p>
              All content, branding, and source code in the App are the exclusive property of Accurack. You may not reuse, copy, or distribute any part of the App without permission.
            </p>
          </section>

          {/* Section 8: Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              8. Termination
            </h2>
            <ul className=" pl-6 space-y-2">
              <li>8.1&nbsp;&nbsp;&nbsp;&nbsp;If you violate these Terms.</li>
              <li>8.2&nbsp;&nbsp;&nbsp;&nbsp;If required by law.</li>
              <li>8.3&nbsp;&nbsp;&nbsp;&nbsp;With notice, for any other reason at our discretion.</li>
            </ul>
          </section>

          {/* Section 9: Disclaimer of Warranties */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              9. Disclaimer of Warranties
            </h2>
            <p>
              The App is provided "as is." We make no warranties regarding reliability, availability, or fitness for a particular purpose. You use the App at your own risk.
            </p>
          </section>

          {/* Section 10: Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              10. Limitation of Liability
            </h2>
            <p>
              To the maximum extent allowed by law, Accurack shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.
            </p>
          </section>

          {/* Section 11: Governing Law */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              11. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of [Insert Your Country/State]. Any disputes shall be resolved in the courts of [Insert Jurisdiction].
            </p>
          </section>

          {/* Section 12: Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 border-b-2 border-[var(--primary-color)] pb-2">
              12. Contact Information
            </h2>
            <p>Accurack Legal & Support Team</p>
            <p>Email: <a href="mailto:info@accurack.com" className="text-[var(--primary-color)] underline">info@accurack.com</a></p>
            <p>Website: <a href="https://www.accurack.com" className="text-[var(--primary-color)] underline">www.accurack.com</a></p>
          </section>
        </main>
      </div>
    </div>
      </>
  );
};

export default TermsAndConditions;