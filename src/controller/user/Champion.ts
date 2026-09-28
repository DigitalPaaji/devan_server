import type { NextFunction, Request, Response } from "express";
import { Champion } from "../../model/champianModel";
import mongoose from "mongoose";






export const getChampions = async (req: Request, res: Response,next: NextFunction) => {
  try {
    const now = new Date();

  
    const currentWeekStart = new Date(now);
    const day = currentWeekStart.getDay();

    const diff = day === 0 ? 6 : day - 1;

    currentWeekStart.setDate(
      currentWeekStart.getDate() - diff
    );
    currentWeekStart.setHours(0, 0, 0, 0);

    // Last week start
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(
      lastWeekStart.getDate() - 7
    );

    // Last week end
    const lastWeekEnd = new Date(currentWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    // Last week champion
    const weekChampion = await Champion.findOne({
      type: "WEEK",
      createdAt: {
        $gte: lastWeekStart,
        $lte: lastWeekEnd,
      },
    })
      .sort({ createdAt: -1 })
      .populate("userId");

    // Current month champion
    const monthChampion = await Champion.findOne({
      type: "MONTH",
    })
      .sort({ createdAt: -1 })
      .populate("userId");

    // Current year champion
    const yearChampion = await Champion.findOne({
      type: "YEAR",
    })
      .sort({ createdAt: -1 })
      .populate("userId");

    // Hall of Fame
    const HOFChampion = await Champion.find({
      type: "hall_of_fame",
    })
      .sort({ createdAt: -1 })
      .populate("userId");

    res.status(200).json({
      success: true,
      champions: {
        weekChampion,
        monthChampion,
        yearChampion,
        HOFChampion,
      },
    });
  } catch (error) {
    next(error);
  }
};







