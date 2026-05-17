#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>

@interface AccountitAPIFileDownloadResponseTests : XCTestCase
@end

@implementation AccountitAPIFileDownloadResponseTests

- (void)testCopyAndSecureCoding {
    XCTAssertTrue([AccountitAPIFileDownloadResponse conformsToProtocol:@protocol(NSCoding)]);
    XCTAssertTrue([AccountitAPIFileDownloadResponse conformsToProtocol:@protocol(NSSecureCoding)]);
    XCTAssertTrue([AccountitAPIFileDownloadResponse conformsToProtocol:@protocol(NSCopying)]);
    XCTAssertTrue([AccountitAPIFileDownloadResponse supportsSecureCoding]);

    NSData *downloadData = [@"resume bytes" dataUsingEncoding:NSUTF8StringEncoding];
    NSURL *downloadURL = [[NSURL alloc] initWithString:@"http://cpa.test/mypage/resumes/resume-1/download"];
    NSHTTPURLResponse *downloadHTTPResponse = [[NSHTTPURLResponse alloc] initWithURL:downloadURL
                                                                          statusCode:200
                                                                         HTTPVersion:@"HTTP/1.1"
                                                                        headerFields:@{
        @"Content-Type": @"application/pdf",
        @"Content-Disposition": @"attachment; filename=\"resume.pdf\""
    }];
    AccountitAPIFileDownloadResponse *download = [[AccountitAPIFileDownloadResponse alloc] initWithData:downloadData
                                                                                               response:downloadHTTPResponse];
    AccountitAPIFileDownloadResponse *downloadCopy = [download copy];
    XCTAssertEqualObjects([downloadCopy data], downloadData);
    XCTAssertEqualObjects([downloadCopy contentType], @"application/pdf");

    NSError *downloadArchiveError = nil;
    NSData *downloadArchiveData = [NSKeyedArchiver archivedDataWithRootObject:download
                                                       requiringSecureCoding:YES
                                                                       error:&downloadArchiveError];
    XCTAssertNil(downloadArchiveError);
    XCTAssertNotNil(downloadArchiveData);

    NSSet *downloadClasses = [[NSSet alloc] initWithObjects:
                              [AccountitAPIFileDownloadResponse class],
                              [AccountitAPIDTO class],
                              [NSDictionary class],
                              [NSArray class],
                              [NSString class],
                              [NSNumber class],
                              [NSData class],
                              [NSNull class],
                              nil];
    NSError *downloadUnarchiveError = nil;
    AccountitAPIFileDownloadResponse *unarchivedDownload = [NSKeyedUnarchiver unarchivedObjectOfClasses:downloadClasses
                                                                                               fromData:downloadArchiveData
                                                                                                  error:&downloadUnarchiveError];
    [downloadClasses release];

    XCTAssertNil(downloadUnarchiveError);
    XCTAssertEqualObjects([unarchivedDownload data], downloadData);
    XCTAssertEqualObjects([unarchivedDownload contentType], @"application/pdf");

    [downloadCopy release];
    [download release];
    [downloadHTTPResponse release];
    [downloadURL release];
}

@end
