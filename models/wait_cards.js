export default class WaitCard{
    constructor(title,imageUrl,waitToDate,profileImage,waitingUsers,description, waitingUsersCount) {
        this.title = title,
        this.imageUrl = imageUrl,
        this.waitToDate= waitToDate
        this.profileImage = profileImage
        this.waitingUsers = waitingUsers
        this.description = description
        this.waitingUsersCount = waitingUsersCount
    }
}