interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-12">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
          <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {title}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {description}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-6 rounded-full"></div>
      </div>
    </div>
  );
}
