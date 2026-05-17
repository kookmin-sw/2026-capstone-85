#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>
#import "AccountitAPIDTOTestSupport.h"

@interface AccountitAPICPAMyCommunityActivityListResponseTests : XCTestCase
@end

@implementation AccountitAPICPAMyCommunityActivityListResponseTests

- (void)testCopyingAndSecureCodingRoundTrip {
    [AccountitAPIDTOTestSupport assertCopyingAndSecureCodingRoundTripForDTOClass:[AccountitAPICPAMyCommunityActivityListResponse class]];
}

@end
