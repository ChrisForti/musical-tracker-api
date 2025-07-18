interface MainpageProps {
  showAdmin?: boolean;
  closeAdmin: () => void;
}

export default function Mainpage({
  showAdmin = false,
  closeAdmin,
}: MainpageProps) {
  return (
    <div className="flex-1 ml-16 md:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main content container - adjusts based on sidebar width */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"></div>
    </div>
  );
}
