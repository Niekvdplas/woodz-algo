import { createRef, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function Inventory() {
  const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl!, supabaseKey!);

  const [inventory, setInventory] = useState([]);
  const lengthinput : any = createRef();
  const sizeinput : any = createRef();
  const [showModal, setShowModal] = useState(false);

  const beamoptions = [
    "69x114",
    "69x114NON",
    "56x69",
    "56x79",
    "56x89",
    "92x114",
    "56x116",
  ];


  const formatDate = (dateString : string) => {
    const options : Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString("nl-NL", options);
  };

  async function clickButton() {
    if(!beamoptions.includes(sizeinput.current.value)){
      return
    }
    if(lengthinput.current.value < 0 || lengthinput.current.value > 6000){
      return
    }
    const { data, error } = await supabase
      .from('Inventory')
      .insert(
        { Beam_Size: sizeinput.current.value, length: lengthinput.current.value })
    setShowModal(false)
    window.location.reload()
  }

  const removeItem = async (event: any, index: any) => {
    event.preventDefault();
    let dataa = [...inventory];
    const { data : Inventory, error } = await supabase
      .from("Inventory")
      .delete()
      .eq("id", dataa[index]['id']);
    dataa.splice(index, 1);
    setInventory(dataa);
  };

  useEffect(() => {
    async function fetchData() {
      const { data: Inventory, error } = await supabase
        .from("Inventory")
        .select("*");
        const k : any = Inventory;
      setInventory(k);
    }
    fetchData();
  }); // Or [] if effect doesn't need props or state

  return (
    
    <div className="flex justify-center h-screen">
      <div className="flex flex-col w-5/6">
      <>
      <button
        className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
        type="button"
        onClick={() => setShowModal(true)}
      >
        Voeg een balk toe aan inventaris
      </button>
      {showModal ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none items-center">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <h3 className="text-3xl font-semibold">
                    Toevoegen
                  </h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Lengte
                  </label>
                  <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" ref={lengthinput} id="lengte" type="number" max="6000" min="0" defaultValue="6000" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Afmeting
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    name="afmeting"
                    defaultValue="69x114"
                    ref={sizeinput}
                  >
                    {beamoptions.map((afmetingOption, index) => {
                      return (
                        <option key={afmetingOption}>{afmetingOption}</option>
                      );
                    })}
                  </select>
                </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Sluit
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => clickButton()}
                  >
                    Toevoegen
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                    >
                      Afmeting
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                    >
                      Lengte
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-6 py-4 text-left hidden md:table-cell"
                    >
                      Toegevoegd aan inventaris
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                    >
                      Verwijder
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item, index) => (
                    <tr className="bg-white border-b" key={item['id']}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item['Beam_Size']}
                      </td>
                      <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                        {item['length']}
                      </td>
                      <td className="hidden text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap md:table-cell">
                        {formatDate(item['created_at'])}
                      </td>
                      <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                        <button
                          className="bg-red-400 hover:bg-red-200 text-gray-800 text-xs font-bold py-2.5 px-4 rounded inline-flex items-center disabled:bg-red-100 disabled:opacity-25"
                          onClick={(event) => removeItem(event, index)}
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>{" "}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
}
