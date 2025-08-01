import React from "react";

type NavbarProps = {
    className?: string
    linkList?: {
        name: string,
        url: string
    }[]
}

export default function Navbar({ className, linkList }: NavbarProps) {
    return (
        <div className={`w-full flex items-center justify-between p-4 ${className}`}>
            <div className="text-xl font-bold">
                PlacementPro
            </div>
            <nav className="flex gap-4">
                {linkList && (linkList.map((item, index) => (
                        <a key={index} className="font-medium transition-colors duration-300 hover:text-gray-300" href={item.url}>
                            {item.name}
                        </a>
                    )))
                }
            </nav>
        </div>
    );
}