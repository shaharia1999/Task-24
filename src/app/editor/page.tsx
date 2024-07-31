import { Suspense } from "react";
import EditorPage from "../component/Display";


const page = () => {
  return (
    <div>
      <Suspense>
      <EditorPage/>
      </Suspense>
       
    </div>
  );
};

export default page;