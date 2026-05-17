#import <AccountitAPI/AccountitAPICPANotificationListResponse.h>

@implementation AccountitAPICPANotificationItem
@end

@implementation AccountitAPICPANotificationListResponse

+ (Class _Nonnull)itemClass {
    return [AccountitAPICPANotificationItem class];
}

@end
