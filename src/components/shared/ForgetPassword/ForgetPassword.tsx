// import { useContext, useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { Link, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import img from "../../../assets/login/login.jpg";
// import axios from "axios";
// import BASEURL from "../../../../Constants";
// import { MdOutlineEmail } from "react-icons/md";
// import { AuthContext } from "../../../context/AuthProvider";
// import { useLocation } from "react-router-dom";
// import { RiLockPasswordLine } from "react-icons/ri";
// import { AiOutlineEye } from "react-icons/ai";

// const ForgetPassword = () => {
//   const location = useLocation();
//   // const [token, setToken] = useState(null);
//   // const [forgotEmail, setForgotEmail] = useState(null);
//   // const [acceptedMsg, setAcceptedMsg] = useState("");
//   const token = localStorage.getItem('token')
//   const email = localStorage.getItem('email')

//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loginLoading, setLoginLoading] = useState(false);
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();
//   const { setLoading } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };
//   useEffect(() => {
//     const searchParams = new URLSearchParams(location.search);
//     const token = searchParams.get("token");
//     const email = searchParams.get("email");
//     // setToken(token);
//     // setForgotEmail(email);
//   }, [location.search]);
//   // console.log(forgotEmail);

//   const handleSignIn = async (data) => {
//     setLoginLoading(true);
//     setLoading(false);
//     const adminData = {
//       email: data.email,
//     };
//     localStorage.setItem('email', data.email)
//     console.log(adminData);
//     try {
//       const response = await axios.post(
//         `${BASEURL}/admin/auth/forget-password/send-otp`,
//         adminData
//       );
//       toast.success(`${response.data.message}`, {
//         position: "top-center",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "light",
//       });
//       if (response.data.status === 'success') {
//         navigate("/email-verify")
//       }
//       console.log(response.data);
//       setLoginLoading(false);
//       return response.data;
//     } catch (error) {
//       toast.error(`${error.response.data.error}`, {
//         position: "top-center",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "light",
//       });

//       console.log(error.response.data);
//       setLoginLoading(false);
//       throw new Error(error.response.data.error);
//     }
//   };

//   const handleSetNewPassword = async (data) => {
//     setLoginLoading(true);
//     setLoading(false);
//     const userData = {
//       email: email,
//       newPassword: data.password,
//     };
//     // navigate("/email-verify");
//     // console.log(userData);
//     try {
//       const response = await axios.post(
//         `${BASEURL}/admin/auth/reset-password`,
//         userData,
//         {
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//             Authorization: token,
//           },
//         }
//       );
//       console.log(response.data);
//       toast.success(`${response.data.message}`, {
//         position: "top-center",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "light",
//       });
//       if (response.data.status === "success") {
//         navigate("/");
//       }
//       setLoginLoading(false);
//       return response.data;
//     } catch (error) {
//       toast.error(`${error.response.data.error}`, {
//         position: "top-center",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "light",
//       });

//       console.log(error.response.data);
//       setLoginLoading(false);
//       throw new Error(error.response.data.error);
//     }
//   };
//   // useEffect(() => {
//   //     handleSignIn()
//   // },[])
//   return (
//     <div className="md:h-screen flex justify-center items-center">
//       <div className="w-full md:w-2/5 mx-auto">
//         {!token ? (
//             <div className="bg-base-100 shadow-2xl p-5 md:p-10 rounded-xl">
//               <div>
//                     <h3 className="text-4xl text-center text-[#202020] md:my-3 font-bold capitalize">
//                       Forgot Password
//                     </h3>
//                     <p className="text-[#202020] text-center py-4">
//                      Please enter your Email to reset your password.
//                     </p>
//                   </div>

//               <form onSubmit={handleSubmit(handleSetNewPassword)}>
//                 <div className="form-control">
//                   <label className="label">
//                     <span className="label-text font-semibold">
//                       New password
//                     </span>
//                   </label>
//                   <div className="relative">
//                     <span className="absolute top-3 text-[#64748B] left-4 text-2xl">
//                       {" "}
//                       <RiLockPasswordLine />
//                     </span>
//                     <input
//                       placeholder="enter password"
//                       className="input input-bordered bg-[#0000001A] w-full pl-14"
//                       type={showPassword ? "text" : "password"}
//                       {...register("password", { required: true })}
//                     />
//                     <button
//                       type="button"
//                       onClick={togglePasswordVisibility}
//                       className="focus:outline-none absolute right-4 top-4 "
//                     >
//                       {showPassword ? (
//                         <AiOutlineEyeInvisible />
//                       ) : (
//                         <AiOutlineEye />
//                       )}
//                     </button>
//                   </div>
//                   {errors.password && (
//                     <span className="text-red-700">
//                       {errors.password.message}
//                     </span>
//                   )}
//                   <label className="label">
//                     <span className="label-text font-semibold text-red-700">
//                       {error}
//                     </span>
//                   </label>
//                 </div>
//                 <div className="form-control mt-6">
//                   <input
//                     type="submit"
//                     className="btn border-none bg-gradient-to-r from-[#1BAE70] to-[#1BAE70] hover:bg-gradient-to-r text-lg hover:from-[#000000] hover:to-[#0b203d] transition text-white"
//                     value={loginLoading ? "Loading.." : "Save Password"}
//                   />
//                 </div>
//               </form>
//               <div>
//                 <div className="text-center p-1 mt-4 text-sm">
//                   <span>Back to </span>{" "}
//                   <span>
//                     <Link to="/login" className="text-[#1A73E7] font-semibold">
//                       Login
//                     </Link>
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="bg-base-100 shadow-2xl p-5 md:p-10 rounded-xl">
//                <div>
//                     <h3 className="text-4xl text-center text-[#202020] md:my-3 font-bold capitalize">
//                       Forgot Password
//                     </h3>
//                     <p className="text-[#202020] text-center py-4">
//                      Please enter your Email to reset your password.
//                     </p>
//                   </div>

//               <form onSubmit={handleSubmit(handleSignIn)}>
//                 <div className="form-control">
//                   <label className="label">
//                     <span className="label-text font-semibold">Email</span>
//                   </label>
//                   <div className="w-full relative">
//                     <span className="absolute text-[#64748B] top-3 left-4 text-2xl">
//                       {" "}
//                       <MdOutlineEmail />
//                     </span>
//                     <input
//                       type="email"
//                       placeholder="enter email"
//                       {...register("email", { required: true })}
//                       className="input w-full bg-[#0000001A] pl-14 input-bordered"
//                     />
//                   </div>
//                   {errors.email && (
//                     <span className="text-red-700">
//                       Please provited your email
//                     </span>
//                   )}
//                 </div>
//                 <div className="form-control mt-6">
//                   <input
//                     type="submit"
//                     className="btn border-none bg-gradient-to-r from-[#1BAE70] to-[#1BAE70] hover:bg-gradient-to-r text-lg hover:from-[#000000] hover:to-[#0b203d] transition text-white"
//                     value={loginLoading ? "Loading.." : "Continue"}
//                   />
//                 </div>
//               </form>
//               <div>
//                 <div className="text-center p-1 mt-4 text-sm">
//                   <span>Back to </span>{" "}
//                   <span>
//                     <Link to="/login" className="text-[#1BAE70] font-semibold">
//                       Login
//                     </Link>
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}
//       </div>
//     </div>
//   );
// };

// export default ForgetPassword;
