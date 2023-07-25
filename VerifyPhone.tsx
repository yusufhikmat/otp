import InputGroup from "./InputGroup";
import Button from "pages/onboarding/common/button/Button";
import Formlayout from "pages/onboarding/common/layout/Formlayout";
import FormHeaderLayout from "pages/onboarding/common/layout/FormHeaderLayout";
import FormTitleLayout from "pages/onboarding/common/layout/FormTitleLayout";
import { Alert } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "redux/hook";
import { sendSms, verifySms } from "redux/actions/authActions";
import Spinner from "component/antd/Spinner";
import { statusActions } from "redux/slice/authslice";
import ButtonOverlay from "pages/onboarding/common/layout/ButtonOverlay";

const Form = () => {
  const [data, setData] = useState<Record<string, string>>({
    0: "",
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
  });
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth);
  const phone = auth.user?.phoneNumber;
  const controller = new AbortController();

  /*----------------FUNCTION TO VERIFY OTP ------------------------------*/

  const verifyOtp = () => {
    dispatch(
      verifySms({
        data: { code: Object.values(data).join("") },
        signal: controller.signal,
      })
    )
      .unwrap()
      .then((action) => {
        console.log(action);
        setData(data);
        navigate("/setup-business");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  // // Add a new useEffect to trigger OTP verification on every input change
  // useEffect(() => {
  //   const code = Object.values(data).join("");
  //   if (code.length === 6) {
  //     verifyOtp();
  //   }
  // }, [data]);
  
  /*----------------FUNCTION TO VERIFY RESENDSMS ------------------------------*/

  const resendSms = () => {
    dispatch(sendSms({ signal: controller.signal }))
      .unwrap()
      .then((action) => {
        setTimer(120);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

   // Fetch OTP on component mount
  useEffect(() => { 
    const controller = new AbortController();
    dispatch(sendSms({ data: { phone }, signal: controller.signal }))
      .unwrap()
      .then((action:any) => console.log(action))
      .catch((error:any) => console.log(error));
    return () => {
      controller.abort();
    };
  }, []);

  // Reset error when data changes

  useEffect(() => {
    setError("");
  }, [data]);

 // Countdown timer for OTP resend

 useEffect(() => {
  const interval = setInterval(() => {
    setTimer((prev) => (prev > 1 ? prev - 1 : prev));
  }, 1000);

  return () => {
    clearInterval(interval);
  };
}, []);


  return (
    <Formlayout>
      <FormHeaderLayout>Verify your phone number</FormHeaderLayout>
      <FormTitleLayout>
        We sent an OTP to {phone.substring(0, 3)}xxxxx
        {phone.substring(8)} by SMS
      </FormTitleLayout>
      {error && (
        <Alert
          className={error ? "flex" : "hidden"}
          message={error}
          type="error"
          onClose={() => setError("")}
          closeText="x"
        />
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          verifyOtp();
        }}
      >
        <div className="text-center my-[1rem]">Enter OTP Code</div>
        <InputGroup verifyInput={verifyOtp} setData={setData} data={data} />
        <Button>
          {auth.isLoading === statusActions.verifySms.isLoading && (
            <ButtonOverlay>
              <Spinner />
            </ButtonOverlay>
          )}
          Verify
        </Button>
        <div className="my-[1rem] flex">
          Didn’t get the code ?{" "}
          {timer > 1 ? (
            <div className="text-blueTheme ml-[0.3rem]">...{timer}</div>
          ) : (
            <div
              className="text-blueTheme cursor-pointer ml-[0.3rem]"
              onClick={resendSms}
            >
              Click Resend
            </div>
          )}
        </div>
        <div className="rounded-[5px] bg-[rgba(55,114,255,0.1)] my-[1rem] p-[1rem] font-[400] text-[12px] leading-[17px] text-blueTheme">
          Still not recevie your OTP kindly cross check you phone number by
          <Link to={"/edit-phone"} className="font-[700] ml-2">
            clicking here
          </Link>
        </div>
      </form>
    </Formlayout>
  );
};

export default Form;
