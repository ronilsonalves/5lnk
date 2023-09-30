"use client";

import { useRouter } from "next/navigation";
import { ArrowSmallLeftIcon } from "@heroicons/react/24/outline";

type BackToProps = {
    title: string;
    route: string;
};

export default function BackTo({title, route}: BackToProps) {
    const router = useRouter();
    return (
        <div className="bg-base-200 max-w-xs mx-auto text-center">
            <button
            className="btn btn-ghost btn-sm rounded-btn"
            onClick={() => router.push(route)}
          >
            <ArrowSmallLeftIcon className="w-8 h-8" />
            Back to {title}
          </button>
        </div>
    );
}