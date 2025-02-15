import {getSession} from "next-auth/react";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {updateModel, userModel} from "../../models/models";
import {AxiosPromise} from "axios";
import {User} from "../../utils/types";

export default async function getProfileHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);
    if (Array.isArray(req.query.username)) return res.status(500).json({message: "Error: multiple usernames in query"});
    const username: string = req.query.username;
    if (!username) return res.status(500).json({message: "Cannot get profile, no username given"});

    try {
        const thisUser = await getProfileRequest(username);

        if (!thisUser) return res.status(404).json({message: "Profile with given username not found"});

        res.status(200).json({data: thisUser});
    } catch (e) {
        res.status(500).json({error: e});
    }
}

export async function getProfileRequest(username: string, thisUser?: User) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    let user = await userModel.findOne({ urlName: username });
    if (user === null) return null;

    let conditions = {userId: user._id};

    if (!thisUser || thisUser._id.toString() !== user._id.toString()) conditions["published"] = true;

    const updates = await updateModel.find(conditions);

    return {user: user, updates: updates};
}

export async function getProfileReducedRequest(username: string) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return await userModel.findOne({ urlName: username });
}