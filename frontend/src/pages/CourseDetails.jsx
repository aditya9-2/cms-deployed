/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useParams } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";

const CourseDetails = () => {
  const [course, setCourse] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRazorpayScript = async () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };
    loadRazorpayScript();
  }, []);

  const fetchSingleCourseData = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/v1/course/get-course-details/${id}`
      );
      const data = response.data;
      setCourse(data.course);
    } catch (err) {
      console.log(`Error While feting individual course: ${err.message}`);
    }
  };
  useEffect(() => {
    if (id) {
      fetchSingleCourseData();
    }
  }, [id]);

  const handlePayment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to purchase the course", {
        position: "bottom-right",
        duration: 1500,
        style: { backgroundColor: "red", color: "white" },
      });
      return;
    }

    try {
      const purchaseCourseResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/payment/purchase-course`,
        {
          courseId: course._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { amount, currency, orderId } = purchaseCourseResponse.data;

      // const data = purchaseCourseResponse.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: amount,
        currency: currency,
        order_id: orderId,
        name: course.title,
        description: `Payment for ${course.title}`,
        prefill: {
          email: "",
          contact: "",
        },
        theme: {
          color: "#5A47AB",
        },

        handler: async (response) => {
          try {
            const veifyResponse = await axios.post(
              `${import.meta.env.VITE_BASE_URL}/api/v1/payment/confirm-payment`,
              {
                paymentDetails: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: amount,
                },
                courseId: course._id,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (veifyResponse.data.message) {
              toast.success("Payment Sucessful", {
                position: "bottom-right",
                duration: 1500,
                style: { backgroundColor: "green", color: "white" },
              });

              setTimeout(() => {
                window.location.reload();
                navigate("/");
              }, 1500);
            }

            console.log(`paymentId: ${response.razorpay_payment_id}`);

            const data = veifyResponse.data;

            console.log(`VerifyResponse: ${data}`);

            console.log(`success: ${data.success}`);

            // if (data.success) {
            //   toast.success("Payment Sucessful", {
            //     position: "bottom-right",
            //     duration: 1500,
            //     style: { backgroundColor: "green", color: "white" },
            //   });

            //   setTimeout(() => {
            //     window.location.reload();
            //     navigate("/");
            //   }, 1500);
            // } else {
            //   toast.error("Payment Failed", {
            //     position: "bottom-right",
            //     duration: 1500,
            //     style: { backgroundColor: "red", color: "white" },
            //   });
            // }
          } catch (err) {
            console.error("Error verifying payment:", err);
            toast.error("Payment verification failed", {
              position: "bottom-right",
              duration: 1500,
              style: { backgroundColor: "red", color: "white" },
            });
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled", {
              position: "bottom-right",
              duration: 1500,
              style: { backgroundColor: "red", color: "white" },
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment initialization failed:", err);
      toast.error("Failed to initialize payment", {
        position: "bottom-right",
        duration: 1500,
      });
    }
  };

  return (
    <div className="h-auto py-18 bg-slate-100">
      {course ? (
        <>
          <div className="h-40 md:h-70 bg-[#5A47AB]">
            <h1 className="text-3xl font-bold text-center pt-5 md:pt-8 text-[#F2F2F2]">
              Course Details for{" "}
              <span className="text-[#FBD15B]">{course.title}</span>
            </h1>
          </div>
          <div className="absolute top-65 md:top-43 left-9 md:left-270 ">
            <CourseCard
              img={course.imageUrl}
              title={course.title}
              subtitle={course.description}
              price={course.price}
              onClick={handlePayment}
              BtnLabel={"Buy Now"}
            />
          </div>
          <div className="mt-110 md:mt-0">
            <h2 className="text-4xl font-semibold p-10 text-[#5A47AB] text-center md:text-start">
              OverView
            </h2>
            <div className="bg-gray-300 h-0.5 w-56 md:w-[40rem] absolute right-20 md:right-210"></div>
            <p className="text-xl text-justify  p-10 text-gray-700   md:w-[64rem]">
              {course.description}
            </p>
          </div>
        </>
      ) : (
        <p className="text-center p-30">Loading course details...</p>
      )}
      <Toaster />
    </div>
  );
};

export default CourseDetails;
