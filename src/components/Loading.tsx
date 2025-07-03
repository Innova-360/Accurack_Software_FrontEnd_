type LoadingProps = {
  label?: string;
};
const Loading = ({ label }: LoadingProps) => {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F4D57] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {label ? label : '...'}</p>
        </div>
      </div>
    </div>
  );
};
export default Loading;