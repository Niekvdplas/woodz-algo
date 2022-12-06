import Link from "next/link";
import { useRouter } from 'next/router';


export default function Navbar() {
    const router = useRouter();
    
    console.log(router.pathname)
    return (
        <div className="flex flex-row justify-between bg-slate-200 mb-4">
            <Link className={router.pathname == '/' ? "bg-slate-100 mx-auto rounded-md w-full py-4 text-center" : "mx-auto rounded-md w-full py-4 text-center"} href='/'>Berekenen</Link>
            <Link className={router.pathname == '/inventory' ? "bg-slate-100 mx-auto rounded-md w-full py-4 text-center" : "mx-auto rounded-md w-full py-4 text-center"} href="/inventory">Inventaris</Link>
        </div>
    )
}