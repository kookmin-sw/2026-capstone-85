#import <AccountitAPI/AccountitAPICPAJobListResponse.h>

@implementation AccountitAPICPAJobListItem
@end

@implementation AccountitAPICPAJobAiSuggestion
@end

@implementation AccountitAPICPAJobListResponse

+ (Class _Nonnull)itemClass {
    return [AccountitAPICPAJobListItem class];
}

@end
