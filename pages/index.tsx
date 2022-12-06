import { useEffect, useState, useRef } from "react";
import { createClient } from '@supabase/supabase-js'


export default function Home() {
  const supabaseUrl : string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey : string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl!, supabaseKey!)
  const [buttons, setButtons] : any = useState([])

  const inputRef = useRef<any>([]);

  const [blurval, setblurval] = useState("");

  const [formFields, setFormFields] = useState([
    { lengte: "", afmeting: "69x114" },
  ]);

  const [outputData, setOutputData] = useState([]);

  const options = [
    "69x114",
    "69x114NON",
    "56x69",
    "56x79",
    "56x89",
    "92x114",
    "56x116",
  ];

  const handleFormChange = (event: any, index: number) => {
    let data: any = [...formFields];
    if (typeof event.target.value === "number"){
      data[index][event.target.name] = Math.max(1, Math.min(6000, event.target.value));
    }
    data[index][event.target.name] = event.target.value;
    setFormFields(data);
  };

  async function addToInventory(beamlength: number, size: string, index : number) {
    let buts = [...buttons]
    buts[index] = false;
    setButtons(buts)
    if (beamlength < 200){
      return
    }
    const { data, error } = await supabase
      .from('Inventory')
      .insert(
        { Beam_Size: size, length: beamlength })
  }

  function buildData(obj: any) {
    let return_str = "";
    if (obj[0] != 6000) {
      return_str += "Inventaris balk met lengte ";
    } else {
      return_str += "Normale balk met lengte ";
    }
    return_str += obj[0];
    return_str += ": [";
    for (let j = 0; j < obj[1][1].length; j++) {
      return_str += obj[1][1][j] + ", ";
    }
    return_str = return_str.slice(0, -2);
    return_str += "], ";
    return_str = return_str.slice(0, -2);
    return_str += ". Over: ";
    return_str += obj[1][0];
    return_str += "\n";
    return return_str;
  }

  const submit = (e: any) => {
    async function fetchData() {
      let { data: Inventory, error } = await supabase
      .from('Inventory')
      .select('*')
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formFields, added_bins: Inventory }),
      };
      let buts = [...buttons];
      fetch("/api/algo", requestOptions)
        .then((response) => response.json())
        .then(async (data: any[]) => {
          for (let obj in data){
            for (let ob in data[obj]){
              buts.push(true)
              for (let entry  in Inventory){
                if (Inventory[entry as keyof object]['length'] == data[obj][ob][0] && Inventory[entry as keyof object]['Beam_Size'] == obj){
                  const { data, error } = await supabase
                  .from('Inventory')
                  .delete()
                  .eq('id', Inventory[entry as keyof object]['id'])

                }
              }
            }
          }
          setOutputData([data as never]);
        });
        setButtons(buts);


    }
    fetchData();
  };

  const clear = () => {
    setFormFields([{ lengte: "", afmeting: "69x114" }]);
    setOutputData([]);
    setButtons([])
  };

  const handleFocus = (index: any) => {
    let data = [...formFields];
    setblurval(data[index].lengte);
    data[index].lengte = "";
    setFormFields(data);
  };

  const handleBlur = (index: any) => {
    let data = [...formFields];
    if (data[index].lengte == "" && blurval != "") {
      data[index].lengte = blurval;
      setblurval("");
      setFormFields(data);
    }
  };

  const kopie = (event: any, index: any) => {
    event.preventDefault();
    let data = [...formFields];
    let newObj = JSON.parse(JSON.stringify(data[index]));
    setFormFields([newObj, ...formFields]);
    setTimeout(() => {
      inputRef.current[0]?.focus();
    }, 100);
  };

  const removeFields = (event: any, index: any) => {
    event.preventDefault();
    let data = [...formFields];
    if (data.length > 1) {
      data.splice(index, 1);
      setFormFields(data);
    }
  };

  return (
    <div className="grid place-items-center">
      {outputData &&
        outputData.map &&
        outputData.map((item: any, index: number) => {
          return Object.keys(item).map((key : any, i) => {
            return (
              <div key={i}>
                <text className="mb-4">
                  Voor maat {key} heb je {item[key as keyof object]['length']} balk(en) nodig met
                  de maten:{""}
                  <br />
                </text>
                {item[key].map((entry: any, index2: number) => {
                  return (
                    <div key={index2} className="flex flex-row">
                      <text
                        className=" my-4 px-4 py-2"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {buildData(entry)}
                      </text>
                     { (entry[1][0] > 200) && buttons[index2] &&
                      <button 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold -ml-3 my-5 rounded-full w-8 h-8 text-center align-items"
                        onClick={() => addToInventory(entry[1][0], key, index2)}
                      >
                        <text>+</text>
                      </button>
                      }
                    </div>
                  );
                })}
              </div>
            );
          });
        })}
      <div className="inline-flex">
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r ml-3"
          onClick={submit}
        >
          Krijg optimale oplossing
        </button>
        <button
          className="bg-red-500 hover:bg-red-100 text-gray-800 font-bold py-2 px-4 rounded-r ml-3"
          onClick={clear}
        >
          Leeg
        </button>
      </div>
      <form className="w-full max-w-lg mt-10" onSubmit={submit}>
        {formFields.map((form, index) => {
          return (
            <div className="flex flex-wrap mx-3 mb-2" key={index}>
              <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                  Lengte
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="lengte"
                  type="number"
                  min="1"
                  max="6000"
                  ref={(el) => (inputRef.current[index] = el)}
                  onFocus={() => handleFocus(index)}
                  onBlur={() => handleBlur(index)}
                  onChange={(event) => handleFormChange(event, index)}
                  value={form.lengte}
                />
              </div>
              <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                  Afmeting
                </label>
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    name="afmeting"
                    defaultValue="69x114"
                    onChange={(event) => handleFormChange(event, index)}
                    value={form.afmeting}
                  >
                    {options.map((afmetingOption, index) => {
                      return (
                        <option key={afmetingOption}>{afmetingOption}</option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="inline-flex">
                <button
                  className="bg-red-400 hover:bg-red-200 text-gray-800 text-xs font-bold md:mt-6 py-2.5 px-4 rounded inline-flex items-center mr-4 disabled:bg-red-100 disabled:opacity-25"
                  onClick={(event) => removeFields(event, index)}
                  disabled={formFields.length == 1}
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
                  <span>Verwijder</span>
                </button>
                <button
                  className="bg-blue-400 hover:bg-blue-200 text-gray-800 text-xs font-bold md:mt-6 py-2.5 px-4 rounded inline-flex items-center"
                  onClick={(event) => kopie(event, index)}
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    ></path>
                  </svg>{" "}
                  <span>Voeg toe</span>
                </button>
              </div>
            </div>
          );
        })}
      </form>
    </div>
  );
}
