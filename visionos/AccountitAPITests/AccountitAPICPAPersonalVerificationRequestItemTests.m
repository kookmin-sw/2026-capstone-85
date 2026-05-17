#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>
#import "AccountitAPIDTOTestSupport.h"

@interface AccountitAPICPAPersonalVerificationRequestItemTests : XCTestCase
@end

@implementation AccountitAPICPAPersonalVerificationRequestItemTests

- (void)testCopyingAndSecureCodingRoundTrip {
    [AccountitAPIDTOTestSupport assertCopyingAndSecureCodingRoundTripForDTOClass:[AccountitAPICPAPersonalVerificationRequestItem class]];
}

@end
