import { useEffect } from "react";
export const useOnOutsideClick = (ref, callback) => {
    const handleClick = (e) => {
        if (!ref.current?.contains(e.target)) {
            callback();
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    });
};
