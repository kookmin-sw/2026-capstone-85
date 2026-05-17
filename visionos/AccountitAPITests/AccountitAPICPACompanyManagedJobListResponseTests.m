#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>
#import "AccountitAPIDTOTestSupport.h"

@interface AccountitAPICPACompanyManagedJobListResponseTests : XCTestCase
@end

@implementation AccountitAPICPACompanyManagedJobListResponseTests

- (void)testCopyingAndSecureCodingRoundTrip {
    [AccountitAPIDTOTestSupport assertCopyingAndSecureCodingRoundTripForDTOClass:[AccountitAPICPACompanyManagedJobListResponse class]];
}

@end
