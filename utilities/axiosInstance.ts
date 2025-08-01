import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { redirect } from "next/navigation";
import { toast } from "react-toastify";

const nextAxios = axios.create({ withCredentials: true });
const flaskAxios = axios.create({ withCredentials: true });

interface SendRequestProps {
    config: AxiosRequestConfig;
    options?: {
        server?: "next" | "flask";
        redirectOnErrorCodes?: number[];
        alertErrorCodes?: number[]
    };
}

export function useSendRequest() {
    const sendRequest = async ({ 
        config,  options = { server: "next", redirectOnErrorCodes: [], alertErrorCodes: [404, 403, 401, 500] }, 
    }: SendRequestProps) => {
        try {
            const instance = options.server === "flask" ? flaskAxios : nextAxios;
            const response: AxiosResponse = await instance(config);

            console.log("Success:", response.data?.success);

            toast("Success!!", {
                autoClose: 2000,
                type: "success"
            })
            return response.data;
        } catch (error) {
            
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const msg = error.response?.data?.error || "An error occurred";
                console.error("Request failed:", status, msg);

                if (status && options.redirectOnErrorCodes?.includes(status)) {
                    return redirect(`/error/${status}`);
                }
                if (status && options.alertErrorCodes?.includes(status)) {
                    toast(`${status} Error Occurred`, {
                        autoClose: 2000,
                        type: "error"
                    })
                }
            } else {
                console.error("Unknown error:", error);
            }

            return toast('Error Occurred', {
                autoClose: 3000,
                type: "error"
            });
        }
    };

    return { sendRequest };
}