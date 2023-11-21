"use client";

import { Suspense, useState } from "react";
import { StatsByDate } from "@/types/Stats";
import StatsChart from "./StatsChart";

interface StatsChartOverviewProps {
  stats: StatsByDate[];
  setDateInterval: Function;
  type: "Links" | "Pages";
}

const StatsChartOverview: React.FC<StatsChartOverviewProps> = ({
  stats,
  setDateInterval,
  type,
}) => {
  const currentDate = new Date();
  const priorDate = new Date().setDate(currentDate.getDate() - 30);
  const [formData, setFormData] = useState({
    startDate: new Date(priorDate).toISOString().split("T")[0],
    endDate: currentDate.toISOString().split("T")[0],
  });
  const [datesError, setDatesError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setFormData({ ...formData, [name]: "" });
      setDatesError("Start date must be before the end date");
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormData({ ...formData, [name]: "" });
      setDatesError("End date must be after the start date");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    e.preventDefault();
    setDateInterval({
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });
    setIsSubmitting(false);
  };

  return (
    <div className="p-7 grid grid-cols-1">
      <h2 className="text-2xl font-bold">{type} stats overview</h2>
      <p className="text-lg font-normal">
        View your {type.toLowerCase()} stats by date. Select a date range to
        update the stats graph.
      </p>
      <form
        className="p-2 flex flex-row justify-between"
        onSubmit={handleSubmit}
      >
        <div className="join">
          <div className="form-control join-item">
            <label className="label">
              <span className="label-text">Start date</span>
            </label>
            <input
              name="startDate"
              type="date"
              max={new Date().toISOString().split("T")[0] || new Date(formData.endDate).toISOString().split("T")[0]}
              placeholder="Start date"
              className="input input-bordered join-item"
              required={true}
              onChange={(e) => handleInputChange(e)}
              value={formData.startDate}
            />
          </div>
          <div className="form-control join-item">
            <label className="label">
              <span className="label-text">End date</span>
            </label>
            <input
              name="endDate"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              placeholder="End date"
              className="input input-bordered join-item"
              required={true}
              onChange={(e) => handleInputChange(e)}
              value={formData.endDate}
            />
          </div>
          <div className="relative form-control">
            <button
              className="btn btn-primary join-item absolute bottom-0"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Loading..." : "Submit"}
            </button>
          </div>
        </div>
      </form>
      {datesError && (
        <span className="p-2 text-xs text-bold text-error">{datesError}</span>
      )}
      <Suspense>
        <StatsChart stats={stats} type={type} height={320} />
      </Suspense>
    </div>
  );
};

export default StatsChartOverview;
