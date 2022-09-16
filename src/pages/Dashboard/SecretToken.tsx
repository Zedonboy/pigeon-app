import { toast } from "react-toastify";
import { useRecoilValue } from "recoil";
import { SecretAtom } from "../../utils/atoms";

export default function SecretTokenPage() {
  const projectSecret = useRecoilValue(SecretAtom);

  let secret = projectSecret?.passcode
  let project = projectSecret?.project

  return (
    <section className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white shadow rounded p-8">
        <h1>
          Copy this code, this code will be used to authorize payments to your
          developers
        </h1>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Project Authorization Token
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <div className="relative flex items-stretch flex-grow focus-within:z-10">
              <input
                type="text"
                name="email"
                id="email"
                value={secret || ""}
                readOnly
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                placeholder="John Smith"
              />
            </div>
            <button
            onClick={e => {
                let cb = navigator.clipboard
                if(secret) cb.writeText(secret).then(e => {
                    toast.success("Copied successfully")
                }).catch(err => {
                    toast.error("Error Copying, you can manually do it.")
                })
            }}
              type="button"
              className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded p-8">
        <h1>
         Fund This Project.
        </h1>
        <div>
      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
        Address
      </label>
      <div className="mt-1">
        <input
          type="email"
          name="email"
          id="address"
          readOnly
          value={project.address}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="you@example.com"
        />
      </div>
    </div>
    <div>
      <label htmlFor="asset-id" className="block text-sm font-medium text-gray-700">
        Payment Asset id.(The asset you will use to pay your workers)
      </label>
      <div className="mt-1">
        <input
          type="text"
          name="email"
          id="asset-id"
          readOnly
          value={project.assetId}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="you@example.com"
        />
      </div>
    </div>
      </div>
    </section>
  );
}
