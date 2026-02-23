import Link from "next/link";

export default function DeployPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Deploy Live</h1>
      <p className="text-gray-400 leading-relaxed mb-10">
        Push your app to production in one click.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Deploy to Vercel</h2>
      <ol className="space-y-2 list-decimal list-inside text-gray-400 leading-relaxed mb-4">
        <li>Open the Export tab in Studio.</li>
        <li>Scroll to the Deploy Live section.</li>
        <li>Enter your Vercel API token (get it from vercel.com/account/tokens).</li>
        <li>Click &quot;Deploy to Vercel&quot;.</li>
        <li>Wait 30–60 seconds.</li>
        <li>Your live URL appears automatically.</li>
      </ol>
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-4 py-3 text-indigo-300 text-sm mb-8">
        Your API token is never stored on our servers. It is used only for this single deployment request.
      </div>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Deploy to Netlify</h2>
      <ol className="space-y-2 list-decimal list-inside text-gray-400 leading-relaxed mb-4">
        <li>Open the Export tab in Studio.</li>
        <li>Scroll to the Deploy Live section.</li>
        <li>Enter your Netlify API token (get it from app.netlify.com/user/applications).</li>
        <li>Click &quot;Deploy to Netlify&quot;.</li>
        <li>Wait for the build to finish.</li>
        <li>Your live URL appears automatically.</li>
      </ol>
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-4 py-3 text-indigo-300 text-sm mb-8">
        Your API token is never stored. It is used only for this deployment request.
      </div>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">After Deployment</h2>
      <p className="text-gray-400 leading-relaxed mb-4">
        The live URL is a Vercel or Netlify preview URL (e.g. your-app-xxx.vercel.app). To redeploy after changes, generate again in Studio and run Deploy once more, or connect your repo to Vercel/Netlify for automatic deploys. Custom domains are configured in your Vercel or Netlify dashboard.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Plan Limits</h2>
      <div className="overflow-x-auto my-4">
        <table className="w-full text-sm border border-gray-700 border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Plan</th>
              <th className="text-left p-3 text-gray-300 font-semibold border-b border-gray-700">Deployments</th>
            </tr>
          </thead>
          <tbody className="text-gray-400">
            <tr className="bg-gray-900 border-b border-gray-700"><td className="p-3">Free</td><td className="p-3">0</td></tr>
            <tr className="bg-gray-950 border-b border-gray-700"><td className="p-3">Pro</td><td className="p-3">10 per month</td></tr>
            <tr className="bg-gray-900"><td className="p-3">Agency</td><td className="p-3">Unlimited</td></tr>
          </tbody>
        </table>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-800">
        <Link href="/docs/api" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Next: API Reference →
        </Link>
      </div>
    </>
  );
}
