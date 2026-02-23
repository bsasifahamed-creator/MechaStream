import Link from "next/link";

export default function PlansPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Plans & Limits</h1>
      <p className="text-gray-400 leading-relaxed mb-10">
        Understand what each plan includes and how limits are applied.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Plan Comparison</h2>
      <div className="overflow-x-auto my-4">
        <table className="w-full text-sm border border-gray-700 border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Feature</th>
              <th className="text-center p-3 text-gray-300 font-semibold border-b border-gray-700">Free</th>
              <th className="text-center p-3 text-gray-300 font-semibold border-b border-gray-700">Pro</th>
              <th className="text-center p-3 text-gray-300 font-semibold border-b border-gray-700">Agency</th>
            </tr>
          </thead>
          <tbody className="text-gray-400">
            <tr className="bg-gray-900 border-b border-gray-700"><td className="p-3">Projects</td><td className="p-3 text-center">3</td><td className="p-3 text-center">20</td><td className="p-3 text-center">∞</td></tr>
            <tr className="bg-gray-950 border-b border-gray-700"><td className="p-3">Generations/month</td><td className="p-3 text-center">10</td><td className="p-3 text-center">100</td><td className="p-3 text-center">∞</td></tr>
            <tr className="bg-gray-900 border-b border-gray-700"><td className="p-3">Pages per project</td><td className="p-3 text-center">2</td><td className="p-3 text-center">10</td><td className="p-3 text-center">∞</td></tr>
            <tr className="bg-gray-950 border-b border-gray-700"><td className="p-3">Exports/month</td><td className="p-3 text-center">3</td><td className="p-3 text-center">∞</td><td className="p-3 text-center">∞</td></tr>
            <tr className="bg-gray-900 border-b border-gray-700"><td className="p-3">Deployments/month</td><td className="p-3 text-center">0</td><td className="p-3 text-center">10</td><td className="p-3 text-center">∞</td></tr>
            <tr className="bg-gray-950 border-b border-gray-700"><td className="p-3">API access</td><td className="p-3 text-center">✓</td><td className="p-3 text-center">✓</td><td className="p-3 text-center">✓</td></tr>
            <tr className="bg-gray-900"><td className="p-3">Priority support</td><td className="p-3 text-center">✗</td><td className="p-3 text-center">✗</td><td className="p-3 text-center">✓</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">How Limits Work</h2>
      <ul className="text-gray-400 leading-relaxed space-y-2 list-disc list-inside mb-8">
        <li>Usage limits (generations, exports, deploys) reset on the 1st of each month.</li>
        <li>Project count is the total number of projects you have, not monthly.</li>
        <li>When you hit a limit you get a 403 response and a limit modal in the app; upgrade or wait until the next month.</li>
        <li>Check current usage on the dashboard or via GET /api/billing/usage.</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Upgrading Your Plan</h2>
      <p className="text-gray-400 leading-relaxed mb-4">
        From the dashboard, open the usage widget and click &quot;Upgrade Plan&quot;, or go to the <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300">/pricing</Link> page. Choose Pro or Agency and complete checkout via Stripe. Billing is monthly; you can cancel anytime from the billing portal. We offer a 14-day refund policy for first-time upgrades.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Frequently Asked Questions</h2>
      <dl className="space-y-6 text-gray-400">
        <div>
          <dt className="font-semibold text-gray-200 mb-1">What happens when I hit my generation limit?</dt>
          <dd>You&apos;ll see a limit modal. Upgrade to continue or wait until the 1st of next month when the counter resets.</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-200 mb-1">Can I export projects I generated on the free plan?</dt>
          <dd>Yes, up to 3 exports per month on the free plan. Pro and Agency have unlimited exports.</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-200 mb-1">Do unused generations roll over?</dt>
          <dd>No. Limits reset on the 1st of each month.</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-200 mb-1">Can I cancel my plan anytime?</dt>
          <dd>Yes. Cancel from the billing portal. Access continues until the end of your current billing period.</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-200 mb-1">Is there a team plan?</dt>
          <dd>The Agency plan covers unlimited usage. Team workspaces are on the roadmap.</dd>
        </div>
      </dl>
    </>
  );
}
