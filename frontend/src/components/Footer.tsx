export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          OsteoNet AI &copy; {new Date().getFullYear()} &mdash; AI-Powered Osteoporosis Risk
          Prediction
        </p>
      </div>
    </footer>
  );
}
