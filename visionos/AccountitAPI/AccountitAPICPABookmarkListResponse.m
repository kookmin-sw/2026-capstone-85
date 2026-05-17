#import <AccountitAPI/AccountitAPICPABookmarkListResponse.h>

@implementation AccountitAPICPABookmarkItem
@end

@implementation AccountitAPICPABookmarkListResponse

+ (Class _Nonnull)itemClass {
    return [AccountitAPICPABookmarkItem class];
}

@end
