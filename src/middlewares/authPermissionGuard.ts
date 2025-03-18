// import { Request, Response, NextFunction } from 'express'
// import catchAsync from '../utils/catchAsync'
// import AppError from '../errors/AppError'
// import { Owner } from '../modules/owner/owner.model'
// import { AssignUserRole } from '../modules/assign_user_store_role/assign_user_store_role_model'
// import { Role } from '../modules/role/role_model'
// import { EndPoint } from '../modules/endPoints/endPoint_model'
// import { TEndPointResources } from '../modules/endPoints/endPoint_interface'
// import { Types } from 'mongoose'

// // const authPermissionGuard = (requiredResource: TEndPointResources) => {
// //   return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
// //     // 1) get userId from req.user (already set by auth() middleware)
// //     const userId = req.user?.user_id
// //     if (!userId) {
// //       throw new AppError(401, 'User not authenticated')
// //     }

// //     console.log('auth guard permission checking.', userId)

// //     // 2) (Optional) যদি Owner হলে সব পারমিশন
// //     //   Owner খুঁজে দেখুন userId == owner.user?
// //     //   যদি মিলে যায়, next() করে বের হয়ে যান
// //     const ownerDoc = await Owner.findOne({ user: userId }).lean()
// //     console.log('onwer info', ownerDoc)
// //     if (ownerDoc) {
// //       // This user is an Owner => pass all
// //       return next()
// //     }

// //     // 3) If not owner, then check user assigned role
// //     //    - এখানে আমরা storeId query করতে পারি, না থাকলে শুধু userId-ভিত্তিতে role আনব
// //     //    - উদাহরণে store param নাই, তাহলে user-কে খুঁজে সরাসরি role আনব
// //     const assignedDoc = await AssignUserRole.findOne({
// //       userId: userId
// //       // যদি storeId লাগে, req.params.storeId সহ যুক্ত করুন
// //       // storeId: req.params.storeId
// //     }).lean()

// //     if (!assignedDoc) {
// //       throw new AppError(403, 'You are not assigned to any store or role')
// //     }

// //     // 4) Fetch role doc
// //     const roleDoc = await Role.findById(assignedDoc.roleId)
// //       .select('endPoints')
// //       .lean()
// //     if (!roleDoc) {
// //       throw new AppError(403, 'Role not found')
// //     }

// //     console.log(roleDoc)
// //     // 5) এখন roleDoc.endPoints => [ObjectId, ...]
// //     //    সেখানে আমাদের requiredResource মিলছে কিনা খুঁজতে EndPoint collection-এ চেক করতে হবে
// //     //    (উদাহরণ: "product:create" resource খুঁজবো)
// //     //    - একাধিক DB call এড়ানোর জন্য populate করে রাখতে পারেন
// //     // এখানে সরাসরি approach: খুঁজে দেখি কোনো EndPoint doc আছে কি না যা
// //     // _id in roleDoc.endPoints AND resource = requiredResource

// //     const matchedEndPoint = await EndPoint.findOne({
// //       _id: { $in: roleDoc.endPoints },
// //       resource: requiredResource
// //     }).lean()

// //     console.log(matchedEndPoint, 'action matching.')
// //     if (!matchedEndPoint) {
// //       throw new AppError(
// //         403,
// //         `You do not have permission for ${requiredResource}`
// //       )
// //     }

// //     // 6) pass
// //     return next()
// //   })
// // }

// const authPermissionGuard = (requiredResource: TEndPointResources) => {
//   return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const userId = req.user?.user_id
//     if (!userId) {
//       throw new AppError(401, 'User not authenticated')
//     }

//     // 1) Check if Owner
//     // const ownerDoc = await Owner.findOne({ user: userId }).lean()
//     // if (ownerDoc) {
//     //   return next()
//     // }

//     // 2) Aggregate pipeline: AssignUserRole -> Role -> EndPoints
//     //    match if endPoints.resource == requiredResource
//     //    যদি পাইপলাইনে কোন ডকুমেন্ট পাই, মানে permission আছে
//     const results = await AssignUserRole.aggregate([
//       {
//         $match: {
//           userId: new Types.ObjectId(userId)
//           // storeId: req.params.storeId (if store-based)
//         }
//       },
//       // // Join with Role
//       {
//         $lookup: {
//           from: Role.collection.name,
//           localField: 'roleId',
//           foreignField: '_id',
//           as: 'roleInfo'
//         }
//       },
//       { $unwind: '$roleInfo' },

//       // Join with EndPoint
//       {
//         $lookup: {
//           from: EndPoint.collection.name,
//           localField: 'roleInfo.endPoints',
//           foreignField: '_id',
//           as: 'endPointsInfo'
//         }
//       },

//       // // এখন endPointsInfo নামের অ্যারেতে resource আছে কি না filter
//       {
//         $match: {
//           'endPointsInfo.resource': requiredResource
//         }
//       },

//       // // আমরা মূলত শুধু _id বা যেকোনো ফিল্ড পেতে পারি
//       // // length > 0 হলেই বুঝব পাওয়া গেছে
//       {
//         $project: {
//           _id: 1
//         }
//       }
//     ])

//     // 3) যদি results ফাঁকা হয়, permission নেই

//     if (!results || results.length === 0) {
//       throw new AppError(
//         403,
//         `You do not have permission for ${requiredResource}`
//       )
//     }

//     // 4) সব ঠিক => next
//     next()
//   })
// }

// export default authPermissionGuard
