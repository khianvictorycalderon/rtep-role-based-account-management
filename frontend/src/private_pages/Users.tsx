import axios from "axios";
import { useEffect, useState } from "react";
import { ROLE_BASED_API_URLS } from "../constants";

export default function Users() {

    const [response, setResponse] = useState<string>("Loading...");
    const handleFetchData = async() => {
      try {
        const res = await axios.get(`${ROLE_BASED_API_URLS.admin}/test`, { withCredentials: true });
        setResponse(res.data.message);
      } catch (e: unknown) {
        setResponse(String(e));
      }
    }

    useEffect(() => {
      handleFetchData();
    }, []);

    return (
      <div className="text-black dark:text-white">
        This is users
        <hr/>
        Backend response: {response}
      </div>
    );
}