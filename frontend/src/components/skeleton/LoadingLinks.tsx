export default function LoadingLinks() {
  return (
      <div className="overflow-x-auto h-1/2">
        <table className="table my-8 py-7">
          <thead className="px-7 bg-base-200">
            <tr>
              <th>ID</th>
              <th>Original URL</th>
              <th>Shortened</th>
              <th>Created</th>
              <th>Clicks</th>
            </tr>
          </thead>
          <tbody className="px-7 animate-pulse bg-white dark:bg-gray-800">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="w-1/6 h-12 bg-gray-300 dark:bg-gray-700 rounded"></td>
                <td className="w-1/3 h-8 bg-gray-300 dark:bg-gray-700 rounded"></td>
                <td className="w-1/4 h-8 bg-gray-300 dark:bg-gray-700 rounded"></td>
                <td className="w-1/8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></td>
                <td className="w-1/12 h-8 bg-gray-300 dark:bg-gray-700 rounded"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
}
