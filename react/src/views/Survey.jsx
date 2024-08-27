import { PlusCircleIcon } from "@heroicons/react/24/outline";
import TButton from "../components/core/TButton";
import PageComponent from "../components/PageComponent";
import SurveyListItem from "../components/SurveyListItem";
import { useStateContext } from "../contexts/ContextProvide";
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import Pagination from "../components/Pagination";
import Loading from "../components/core/Loading";
import router from "../router";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

export default function Survey() {
  // const { surveys } = useStateContext();
  const { showToast } = useStateContext();
  const [surveys, setSurveys] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSurveyId, setCurrentSurveyId] = useState(null);

  const openModal = (id) => {
    setCurrentSurveyId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSurveyId(null);
  };

  const handleConfirmDelete = () => {
    axiosClient.delete(`/survey/${currentSurveyId}`).then(() => {
      getSurveys();
      showToast("Survey was deleted");
    });
  };


  const onDeleteClick = (id) => {
    openModal(id);
  };

  // const onDeleteClick = (id) => {
  //   if (window.confirm('Are you sure you want to delete this surevy?'))
  //     axiosClient.delete(`/survey/${id}`)
  //     .then(() => {
  //       getSurveys()
  //     })
  // };

  const onPageClick = (link) => {
    getSurveys(link.url);
  };

  const getSurveys = (url) => {
    url = url || "/survey";
    setLoading(true);
    axiosClient.get(url).then(({ data }) => {
      setSurveys(data?.data);
      setMeta(data?.meta);
      setLoading(false);
    });
  };

  useEffect(() => {
    getSurveys();
  }, []);

  return (
    <PageComponent
      title="Survey"
      buttons={
        <TButton color="blue" to="/surveys/create">
          <PlusCircleIcon className="h-6 w-6 mr-2" />
          Create New
        </TButton>
      }
    >
      {loading && (
        <div className="my-16">
          <Loading />
        </div>
      )}

      {!loading && (
        <div>
          {surveys?.length === 0 && (
              <div className="py-10 text-center my-auto text-gray-800">
                No surveys to display. Your surveys will appear here!
              </div>
            )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-6 md:grid-cols-3">

            {surveys?.map((survey) => (
              <SurveyListItem
                key={survey.id}
                survey={survey}
                onDeleteClick={() => onDeleteClick(survey.id)}
              />
            ))}
          </div>
          <DeleteConfirmationModal
            isOpen={isModalOpen}
            closeModal={closeModal}
            onConfirm={handleConfirmDelete}
          />
          {surveys.length > 0 && <Pagination meta={meta} onPageClick={onPageClick} />}
        </div>
      )}
    </PageComponent>
  );
}
