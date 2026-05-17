#import <Foundation/Foundation.h>
#import <AccountitAPI/AccountitAPIDTO.h>

NS_ASSUME_NONNULL_BEGIN

typedef void (^AccountitAPICompletionHandler)(AccountitAPIDTO * _Nullable response, NSError * __autoreleasing * _Nullable error);

@interface AccountitAPIService : NSObject

- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;

+ (NSProgress *)cpaHealthWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaHealthzWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaRegisterWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaLoginWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaMeWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaLogoutWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaJobsWithQuery:(nullable NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaJobCalendarWithQuery:(NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaJobDetailWithID:(NSString *)jobID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaRecordJobEngagementWithJobID:(NSString *)jobID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCompaniesWithQuery:(nullable NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCompanyDetailWithID:(NSString *)companyID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaMyCompanyWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaMyCompanyAnalyticsWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateCompanyProfileSubmissionWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaUpdateCompanyLogoWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaUpdateCompanyBackgroundWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateCompanyJobAutofillDraftWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateCompanyJobSubmissionWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaMyCompanyJobSubmissionsWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaUpdateMyCompanyJobSubmissionWithID:(NSString *)submissionID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCancelMyCompanyJobSubmissionWithID:(NSString *)submissionID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaMyCompanyJobsWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateCompanyJobEditSubmissionWithJobID:(NSString *)jobID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCloseMyCompanyJobWithID:(NSString *)jobID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateCompanyLogoUploadURLWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateCompanyBackgroundUploadURLWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateProfileImageUploadURLWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCompleteAssetUploadWithID:(NSString *)assetID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaUploadLocalAssetWithID:(NSString *)assetID data:(NSData *)data contentType:(NSString *)contentType completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaJobFilterPreferenceWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaUpdateJobFilterPreferenceWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaJobPresetsWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateJobPresetWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaUseJobPresetWithID:(NSString *)presetID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaDeleteJobPresetWithID:(NSString *)presetID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaMyProfileWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaUpdateMyProfileWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaDeleteMyProfileImageWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaUpdatePasswordWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaMyCommunityActivityWithQuery:(nullable NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreatePersonalVerificationRequestWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaBookmarksWithQuery:(nullable NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateBookmarkWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaDeleteBookmarkWithID:(NSString *)bookmarkID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaJobFitAnalysesWithQuery:(nullable NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaHighFitJobAnalysesWithQuery:(nullable NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateJobFitAnalysisWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaResumesWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateResumeWithData:(NSData *)data fileName:(NSString *)fileName contentType:(NSString *)contentType completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaDownloadResumeWithID:(NSString *)resumeID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaDeleteResumeWithID:(NSString *)resumeID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaSetPrimaryResumeWithID:(NSString *)resumeID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaNotificationsWithQuery:(nullable NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaNotificationUnreadCountWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaMarkAllNotificationsReadWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaMarkNotificationReadWithID:(NSString *)notificationID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaTagSubscriptionsWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaSubscribeTagWithLabelID:(NSString *)labelID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaUnsubscribeTagWithLabelID:(NSString *)labelID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCommunityPostsWithQuery:(nullable NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCommunityPostDetailWithID:(NSString *)postID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateCommunityPostWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaCreateCommunityAnswerWithPostID:(NSString *)postID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaLikeCommunityPostWithID:(NSString *)postID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaLikeCommunityAnswerWithID:(NSString *)answerID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaResolveCommunityPostWithID:(NSString *)postID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminHealthWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminDashboardWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminSourcesWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminJobsWithQuery:(nullable NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminJobWithID:(NSString *)jobID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminCreateJobWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminUpdateJobWithID:(NSString *)jobID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminCloseJobWithID:(NSString *)jobID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminUpdateJobStatusWithID:(NSString *)jobID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminRefreshJobWithID:(NSString *)jobID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminAiSuggestionsWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminApproveAiSuggestionWithID:(NSString *)suggestionID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminRejectAiSuggestionWithID:(NSString *)suggestionID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminCompaniesWithQuery:(nullable NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminCompanyWithID:(NSString *)companyID completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminCreateCompanyWithBody:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminUpdateCompanyWithID:(NSString *)companyID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminMembersWithQuery:(nullable NSDictionary<NSString *, id> *)query completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminPersonalVerificationRequestsWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminApprovePersonalVerificationRequestWithID:(NSString *)requestID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminRejectPersonalVerificationRequestWithID:(NSString *)requestID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminJobSubmissionsWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminApproveJobSubmissionWithID:(NSString *)submissionID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminRejectJobSubmissionWithID:(NSString *)submissionID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminProfileSubmissionsWithCompletionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminApproveProfileSubmissionWithID:(NSString *)submissionID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaAdminRejectProfileSubmissionWithID:(NSString *)submissionID body:(NSDictionary<NSString *, id> *)body completionHandler:(AccountitAPICompletionHandler)completionHandler;
+ (NSProgress *)cpaOpsDeployWithBody:(NSDictionary<NSString *, id> *)body bearerToken:(NSString *)bearerToken completionHandler:(AccountitAPICompletionHandler)completionHandler;

@end

NS_ASSUME_NONNULL_END
