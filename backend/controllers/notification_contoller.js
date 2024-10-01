import Notifications from '../models/notification_model.js'

export const getNotifications = async (req, res)=>{
    try{
        const userId = req.user._id;

        const notifications = await Notifications.find({to:userId}).populate({
            path:'from',
            select:'username profileImage'
        });
        await Notifications.updateMany({to:userId},{read:true});
        res.status(200).json({notifications});
    }catch(err){
        console.log(`Error occured at the function getNotifications`);
        res.status(500).json({err:`Internal erro-${err}`});
    }
}
export const deleteNotifications = async (req, res)=>{
    try{
        const userId = req.user._id;

        await Notifications.deleteMany({to:userId});
        res.status(200).json({message:"Notifications deleted successfully"});

    }catch(err){
        console.log("Error occured at the deleteNotifications function");
        res.status(500).json({err:`Internal error has occcred-${err}`});
    }
}