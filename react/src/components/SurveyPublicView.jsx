import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../axios";
import Loading from "./core/Loading";
import PublicQuestionView from "./core/PublicQuestionView";
import Error from "./core/Error";

function SurveyPublicView() {
  const answers = {};
  const [survey, setSurvey] = useState({ questions: [] });
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slug } = useParams();

  useEffect(() => {
    const fetchSurvey = async () => {
      // setLoading(true);
      try {
        const response = await axiosClient.get(`survey/get-by-slug/${slug}`);
        setSurvey(response.data.data);
      } catch (error) {
        if (error.response) {
          // Server responded with a status code outside the 2xx range
          if (error.response.status === 404) {
            setError(
              "The survey you are looking for does not exist or is unavailable."
            );
          } else if (error.response.status === 500) {
            setError(
              "An error occurred on the server. Please try again later."
            );
          } else {
            setError("An unexpected error occurred. Please try again.");
          }
        } else if (error.request) {
          // Request was made but no response was received
          setError(
            "Unable to reach the server. Please check your internet connection and try again."
          );
        } else {
          // Something else happened while setting up the request
          setError("An error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [slug]);

  function answerChanged(question, value) {
    answers[question.id] = value;
    // console.log(question, value)
  }
  function onSubmit(e) {
    e.preventDefault();
    axiosClient
      .post(`/survey/${survey.id}/answer`, {
        answers,
      })
      .then((response) => {
        setSurveyCompleted(true);
      });
  }
  return (
    <div>
      {loading && (
        <div className="pt-10">
          <Loading />
        </div>
      )}
      {error && (
        <div className="pt-10">
          <Error error={error} />
        </div>
      )}
      {!loading && !error && (
        <form onSubmit={(e) => onSubmit(e)} className="container mx-auto mt-10">
          {surveyCompleted && (
            <div className="py-8 px-6 bg-emerald-500 text-white w-[600px] mx-auto">
              Thank you for participating in this survey
            </div>
          )}

          {!surveyCompleted && (
            <>
              <div className="grid grid-cols-6">
                <div className="mr-4 mt-2">
                  <img src={survey.image_url} alt="" />
                </div>
                <div className="col-span-5">
                  <h1 className="text-3xl mb-3">{survey.title}</h1>
                  <p className="text-gray-500 text-sm mb-3">
                    Expiry Date: {survey.expiry_date}
                  </p>
                  <p className="text-gray-500 text-sm mb-3">
                    {survey.description}
                  </p>
                </div>
              </div>
              <div>
                {survey?.questions?.map((question, index) => (
                  <PublicQuestionView
                    key={question.id}
                    question={question}
                    index={index}
                    answerChanged={(v) => answerChanged(question, v)}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md
            text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
}

export default SurveyPublicView;
