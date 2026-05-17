#import <AccountitAPI/AccountitAPICPACompanyListResponse.h>

@implementation AccountitAPICPACompanyListItem
@end

@implementation AccountitAPICPACompanyListResponse

+ (Class _Nonnull)itemClass {
    return [AccountitAPICPACompanyListItem class];
}

@end
