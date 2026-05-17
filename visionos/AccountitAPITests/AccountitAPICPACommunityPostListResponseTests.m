#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>
#import "AccountitAPIDTOTestSupport.h"

@interface AccountitAPICPACommunityPostListResponseTests : XCTestCase
@end

@implementation AccountitAPICPACommunityPostListResponseTests

- (void)testCopyingAndSecureCodingRoundTrip {
    [AccountitAPIDTOTestSupport assertCopyingAndSecureCodingRoundTripForDTOClass:[AccountitAPICPACommunityPostListResponse class]];
}

@end
