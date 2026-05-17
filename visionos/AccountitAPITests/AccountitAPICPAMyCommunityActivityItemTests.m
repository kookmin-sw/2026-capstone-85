#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>
#import "AccountitAPIDTOTestSupport.h"

@interface AccountitAPICPAMyCommunityActivityItemTests : XCTestCase
@end

@implementation AccountitAPICPAMyCommunityActivityItemTests

- (void)testCopyingAndSecureCodingRoundTrip {
    [AccountitAPIDTOTestSupport assertCopyingAndSecureCodingRoundTripForDTOClass:[AccountitAPICPAMyCommunityActivityItem class]];
}

@end
