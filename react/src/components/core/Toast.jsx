import { useStateContext } from "../../contexts/ContextProvide";

function Toast() {
  const {toast} = useStateContext();
  return (
    <>
     { toast.show && <div className="w-[300px] toast toast-bottom toast-end">

        <div className="alert alert-success text-white">
          <span>{toast.message}</span>
        </div>
      </div>}
    </>
  );
}

export default Toast;
